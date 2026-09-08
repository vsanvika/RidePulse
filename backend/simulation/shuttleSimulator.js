const Shuttle = require("../models/Shuttle");
const Route = require("../models/Route");
const Stop = require("../models/Stop");

let isRunning = false;
let intervalId = null;
let ioInstance = null;

// In-memory simulation states for active shuttles
const shuttleSimStates = new Map();

// Generate intermediate waypoint coordinates between two lat/lng points
function interpolatePoints(p1, p2, numSteps = 10) {
  const points = [];
  for (let i = 0; i <= numSteps; i++) {
    const lat = p1.latitude + (p2.latitude - p1.latitude) * (i / numSteps);
    const lng = p1.longitude + (p2.longitude - p1.longitude) * (i / numSteps);
    points.push({ latitude: lat, longitude: lng });
  }
  return points;
}

// Calculate distance in meters between two lat/lng points (Haversine formula)
function getDistanceMeters(p1, p2) {
  const R = 6371e3; // metres
  const φ1 = (p1.latitude * Math.PI) / 180;
  const φ2 = (p2.latitude * Math.PI) / 180;
  const Δφ = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const Δλ = ((p2.longitude - p1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Calculate ETA in minutes based on distance and speed (km/h)
function calculateEtaMinutes(distanceMeters, speedKmH) {
  if (!speedKmH || speedKmH <= 0) return 2; // default 2 mins
  const speedMetersPerSec = (speedKmH * 1000) / 3600;
  const timeSec = distanceMeters / speedMetersPerSec;
  return Math.max(1, Math.ceil(timeSec / 60));
}

// Determine crowd level based on occupancy percentage
function getCrowdLevel(passengerCount, capacity = 40) {
  const ratio = passengerCount / capacity;
  if (ratio >= 0.8) return "HIGH";
  if (ratio >= 0.4) return "MEDIUM";
  return "LOW";
}

async function initializeSimulation() {
  try {
    const shuttles = await Shuttle.find({})
      .populate("route")
      .populate({ path: "route", populate: { path: "stops" } })
      .populate("currentStop")
      .populate("nextStop");

    shuttleSimStates.clear();

    for (const shuttle of shuttles) {
      if (!shuttle.route || !shuttle.route.stops || shuttle.route.stops.length < 2) {
        continue;
      }

      const stops = shuttle.route.stops;
      // Generate route polyline waypoints connecting all stops sequentially
      const routeWaypoints = [];
      for (let i = 0; i < stops.length; i++) {
        const currentStopLoc = stops[i].location;
        const nextStopLoc = stops[(i + 1) % stops.length].location;
        const segmentPoints = interpolatePoints(currentStopLoc, nextStopLoc, 12);
        
        // Exclude last point of segment to avoid duplicates
        routeWaypoints.push(...segmentPoints.slice(0, -1));
      }

      // Initial index on the waypoints loop
      const initialWayPointIdx = Math.floor(Math.random() * routeWaypoints.length);
      const initialLoc = routeWaypoints[initialWayPointIdx] || stops[0].location;

      shuttleSimStates.set(shuttle._id.toString(), {
        shuttleId: shuttle.shuttleId,
        mongoId: shuttle._id,
        vehicleNumber: shuttle.vehicleNumber,
        capacity: shuttle.capacity || 40,
        routeId: shuttle.route.routeId,
        routeName: shuttle.route.name,
        color: shuttle.route.color,
        stops: stops,
        waypoints: routeWaypoints,
        currentWaypointIdx: initialWayPointIdx,
        dwellTicks: 0,
        currentStopIdx: 0,
        currentLocation: initialLoc,
        speed: 24, // km/h
        passengerCount: shuttle.passengerCount || 15,
        crowdLevel: shuttle.crowdLevel || "LOW",
        status: shuttle.status === "OFFLINE" ? "ON_TIME" : shuttle.status,
      });
    }

    console.log(`Initialized simulation engine for ${shuttleSimStates.size} shuttles.`);
  } catch (error) {
    console.error("Error initializing simulation engine:", error.message);
  }
}

async function simulationTick() {
  if (!isRunning) return;

  for (const [id, state] of shuttleSimStates.entries()) {
    if (state.status === "STOPPED" || state.status === "OFFLINE" || state.status === "BREAKDOWN") {
      continue;
    }

    // Dwell time at stops handling
    if (state.dwellTicks > 0) {
      state.dwellTicks -= 1;
      state.speed = 0;

      // When dwelling ends, fluctuate passenger count realistically
      if (state.dwellTicks === 0) {
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        state.passengerCount = Math.min(
          state.capacity,
          Math.max(2, state.passengerCount + delta)
        );
        state.crowdLevel = getCrowdLevel(state.passengerCount, state.capacity);
        state.speed = 22 + Math.floor(Math.random() * 10); // 22 - 31 km/h
      }
    } else {
      // Advance to next waypoint
      state.currentWaypointIdx = (state.currentWaypointIdx + 1) % state.waypoints.length;
      state.currentLocation = state.waypoints[state.currentWaypointIdx];

      // Check proximity to any stop on route
      let nearestStopIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < state.stops.length; i++) {
        const dist = getDistanceMeters(state.currentLocation, state.stops[i].location);
        if (dist < minDistance) {
          minDistance = dist;
          nearestStopIndex = i;
        }
      }

      // If within 25 meters of a stop, enter dwell phase briefly
      if (minDistance < 25 && state.currentStopIdx !== nearestStopIndex) {
        state.currentStopIdx = nearestStopIndex;
        state.dwellTicks = 4; // 4 seconds at stop
        state.speed = 0;
      }
    }

    // Calculate current and next stop references
    const currentStopObj = state.stops[state.currentStopIdx] || state.stops[0];
    const nextStopIdx = (state.currentStopIdx + 1) % state.stops.length;
    const nextStopObj = state.stops[nextStopIdx] || state.stops[0];

    const distToNextStop = getDistanceMeters(state.currentLocation, nextStopObj.location);
    const etaMins = calculateEtaMinutes(distToNextStop, state.speed > 0 ? state.speed : 25);

    // Prepare socket payload
    const updatePayload = {
      shuttleId: state.shuttleId,
      _id: state.mongoId,
      vehicleNumber: state.vehicleNumber,
      capacity: state.capacity,
      route: {
        _id: state.stops[0]?.route,
        routeId: state.routeId,
        name: state.routeName,
        color: state.color,
      },
      currentLocation: state.currentLocation,
      speed: state.speed,
      passengerCount: state.passengerCount,
      crowdLevel: state.crowdLevel,
      status: state.status,
      currentStop: currentStopObj,
      nextStop: nextStopObj,
      eta: etaMins,
      lastUpdated: new Date().toISOString(),
    };

    // Broadcast real-time events via Socket.IO
    if (ioInstance) {
      ioInstance.emit("shuttle:location", {
        shuttleId: state.shuttleId,
        _id: state.mongoId,
        currentLocation: state.currentLocation,
        speed: state.speed,
        eta: etaMins,
      });

      ioInstance.emit("shuttle:update", updatePayload);
      ioInstance.emit("shuttle:crowd", {
        shuttleId: state.shuttleId,
        crowdLevel: state.crowdLevel,
        passengerCount: state.passengerCount,
      });
    }

    // Periodically update MongoDB asynchronously (non-blocking)
    Shuttle.findByIdAndUpdate(state.mongoId, {
      currentLocation: state.currentLocation,
      speed: state.speed,
      passengerCount: state.passengerCount,
      crowdLevel: state.crowdLevel,
      status: state.status,
      currentStop: currentStopObj._id,
      nextStop: nextStopObj._id,
      lastUpdated: new Date(),
    }).catch(() => {});
  }
}

function startSimulation(io) {
  if (io) ioInstance = io;
  if (isRunning) return true;

  isRunning = true;
  if (shuttleSimStates.size === 0) {
    initializeSimulation();
  }

  intervalId = setInterval(simulationTick, 1000); // Tick every 1 second
  if (ioInstance) {
    ioInstance.emit("simulation:status", { isRunning: true, count: shuttleSimStates.size });
  }
  console.log("Shuttle simulation engine STARTED.");
  return true;
}

function pauseSimulation() {
  isRunning = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (ioInstance) {
    ioInstance.emit("simulation:status", { isRunning: false });
  }
  console.log("Shuttle simulation engine PAUSED.");
  return true;
}

async function resetSimulation() {
  pauseSimulation();
  await initializeSimulation();
  if (ioInstance) {
    ioInstance.emit("simulation:status", { isRunning: false, reset: true });
  }
  console.log("Shuttle simulation engine RESET.");
  return true;
}

function getSimulationStatus() {
  return {
    isRunning,
    activeShuttlesCount: shuttleSimStates.size,
    shuttles: Array.from(shuttleSimStates.values()).map((s) => ({
      shuttleId: s.shuttleId,
      status: s.status,
      currentLocation: s.currentLocation,
      speed: s.speed,
      passengerCount: s.passengerCount,
      crowdLevel: s.crowdLevel,
    })),
  };
}

function applySimulationEvent(action, shuttleId) {
  const states = shuttleId
    ? [...shuttleSimStates.values()].filter((state) => state.shuttleId === shuttleId)
    : [...shuttleSimStates.values()];

  if (!states.length) return false;

  for (const state of states) {
    if (action === "DELAY") state.status = "DELAYED";
    if (action === "BREAKDOWN") state.status = "BREAKDOWN";
    if (action === "HIGH_CROWD") {
      state.passengerCount = state.capacity;
      state.crowdLevel = "HIGH";
    }
    if (action === "RECOVER") {
      state.status = "ON_TIME";
      state.passengerCount = Math.min(state.passengerCount, Math.floor(state.capacity * 0.6));
      state.crowdLevel = getCrowdLevel(state.passengerCount, state.capacity);
    }

    if (ioInstance) {
      ioInstance.emit("shuttle:status", { shuttleId: state.shuttleId, status: state.status });
      ioInstance.emit("shuttle:crowd", {
        shuttleId: state.shuttleId,
        crowdLevel: state.crowdLevel,
        passengerCount: state.passengerCount,
      });
    }
    Shuttle.findByIdAndUpdate(state.mongoId, {
      status: state.status,
      passengerCount: state.passengerCount,
      crowdLevel: state.crowdLevel,
    }).catch(() => {});
  }

  return true;
}

module.exports = {
  startSimulation,
  pauseSimulation,
  resetSimulation,
  getSimulationStatus,
  initializeSimulation,
  applySimulationEvent,
};
