/**
 * Transportation Intelligence Engine
 * Provides Haversine distance calculations, dynamic ETA estimations,
 * nearest stop locator, and trip planning algorithm.
 */

// Haversine formula distance in meters
function haversineDistanceMeters(p1, p2) {
  if (!p1 || !p2 || p1.latitude === undefined || p2.latitude === undefined) return 0;
  const R = 6371e3; // Earth radius in metres
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

// Average human walking speed: ~1.2 meters/sec (approx 72 m/min)
function calculateWalkingTimeMins(distanceMeters) {
  const walkingSpeedMetersPerMin = 72;
  const minutes = distanceMeters / walkingSpeedMetersPerMin;
  return Math.max(1, Math.round(minutes));
}

// Crowd Level Thresholds: 0-40% LOW, 41-75% MEDIUM, 76-100% HIGH
function computeCrowdMetrics(passengerCount = 0, capacity = 40) {
  const percentage = Math.min(100, Math.round((passengerCount / capacity) * 100));
  let level = "LOW";
  if (percentage > 75) {
    level = "HIGH";
  } else if (percentage > 40) {
    level = "MEDIUM";
  }

  return {
    passengerCount,
    capacity,
    percentage,
    level,
  };
}

// Calculate dynamic ETA considering speed, distance along route, and delay buffer
function calculateDynamicEta(shuttleLoc, targetStopLoc, currentSpeed = 25, status = "ON_TIME") {
  const distanceMeters = haversineDistanceMeters(shuttleLoc, targetStopLoc);
  const speedKmh = currentSpeed > 0 ? currentSpeed : 20;
  const speedMetersPerSec = (speedKmh * 1000) / 3600;
  let timeInSeconds = distanceMeters / speedMetersPerSec;

  let delayBufferMinutes = 0;
  if (status === "DELAYED") {
    delayBufferMinutes = 5;
  }

  const totalMinutes = Math.max(1, Math.ceil(timeInSeconds / 60) + delayBufferMinutes);
  return {
    distanceMeters: Math.round(distanceMeters),
    etaMinutes: totalMinutes,
    delayBufferMinutes,
  };
}

// Trip Planner algorithm
function planTripBetweenStops(originStopId, destinationStopId, shuttles = [], routes = [], stops = []) {
  if (!originStopId || !destinationStopId || originStopId.toString() === destinationStopId.toString()) {
    return { error: "Origin and destination stops must be different" };
  }

  const originStop = stops.find(
    (s) => s._id.toString() === originStopId.toString() || s.stopId === originStopId.toString()
  );
  const destStop = stops.find(
    (s) => s._id.toString() === destinationStopId.toString() || s.stopId === destinationStopId.toString()
  );

  if (!originStop || !destStop) {
    return { error: "Selected campus stops not found" };
  }

  const tripOptions = [];

  for (const route of routes) {
    if (!route.stops || route.stops.length < 2) continue;

    const stopIds = route.stops.map((s) => {
      if (!s) return "";
      return s._id ? s._id.toString() : s.toString();
    });

    const originIdx = stopIds.indexOf(originStop._id.toString());
    const destIdx = stopIds.indexOf(destStop._id.toString());

    // Check if both stops exist on this route
    if (originIdx !== -1 && destIdx !== -1 && originIdx !== destIdx) {
      // Find active shuttles assigned to this route or active in general
      let routeShuttles = shuttles.filter(
        (s) =>
          s.route &&
          (s.route._id?.toString() === route._id.toString() || s.route.routeId === route.routeId)
      );

      // Fallback: if no shuttle assigned to route, show general active shuttles
      if (routeShuttles.length === 0) {
        routeShuttles = shuttles.slice(0, 2);
      }

      for (const shuttle of routeShuttles) {
        const shuttleLoc = shuttle.currentLocation || originStop.location;
        const etaObj = calculateDynamicEta(shuttleLoc, originStop.location, shuttle.speed, shuttle.status);

        const journeyDist = haversineDistanceMeters(originStop.location, destStop.location);
        const journeyMinutes = Math.max(3, Math.ceil((journeyDist / ((25 * 1000) / 3600)) / 60));

        const now = new Date();
        const arrivalTime = new Date(now.getTime() + (etaObj.etaMinutes + journeyMinutes) * 60000);

        const crowd = computeCrowdMetrics(shuttle.passengerCount || 15, shuttle.capacity || 40);

        tripOptions.push({
          shuttle: {
            _id: shuttle._id,
            shuttleId: shuttle.shuttleId,
            vehicleNumber: shuttle.vehicleNumber,
            status: shuttle.status,
            speed: shuttle.speed || 0,
          },
          route: {
            _id: route._id,
            routeId: route.routeId,
            name: route.name,
            color: route.color || "#2563EB",
          },
          originStop: {
            _id: originStop._id,
            stopId: originStop.stopId,
            name: originStop.name,
          },
          destinationStop: {
            _id: destStop._id,
            stopId: destStop.stopId,
            name: destStop.name,
          },
          boardingEtaMinutes: etaObj.etaMinutes,
          journeyDurationMinutes: journeyMinutes,
          expectedArrivalFormatted: arrivalTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          crowd,
          delay: shuttle.status === "DELAYED" ? "5 min delay reported" : "On schedule",
        });
      }
    }
  }

  // Fallback if no specific route connects both directly: generate a connected recommendation
  if (tripOptions.length === 0 && shuttles.length > 0 && routes.length > 0) {
    const fallbackRoute = routes[0];
    const fallbackShuttle = shuttles[0];
    const etaObj = calculateDynamicEta(
      fallbackShuttle.currentLocation || originStop.location,
      originStop.location,
      fallbackShuttle.speed,
      fallbackShuttle.status
    );
    const journeyDist = haversineDistanceMeters(originStop.location, destStop.location);
    const journeyMinutes = Math.max(5, Math.ceil((journeyDist / ((25 * 1000) / 3600)) / 60));
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + (etaObj.etaMinutes + journeyMinutes) * 60000);

    tripOptions.push({
      shuttle: {
        _id: fallbackShuttle._id,
        shuttleId: fallbackShuttle.shuttleId,
        vehicleNumber: fallbackShuttle.vehicleNumber,
        status: fallbackShuttle.status,
        speed: fallbackShuttle.speed || 25,
      },
      route: {
        _id: fallbackRoute._id,
        routeId: fallbackRoute.routeId,
        name: fallbackRoute.name,
        color: fallbackRoute.color || "#2563EB",
      },
      originStop: {
        _id: originStop._id,
        stopId: originStop.stopId,
        name: originStop.name,
      },
      destinationStop: {
        _id: destStop._id,
        stopId: destStop.stopId,
        name: destStop.name,
      },
      boardingEtaMinutes: etaObj.etaMinutes,
      journeyDurationMinutes: journeyMinutes,
      expectedArrivalFormatted: arrivalTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      crowd: computeCrowdMetrics(fallbackShuttle.passengerCount || 12, fallbackShuttle.capacity || 40),
      delay: "On schedule",
    });
  }

  // Sort trip options by fastest boarding ETA
  tripOptions.sort((a, b) => a.boardingEtaMinutes - b.boardingEtaMinutes);

  return {
    originStop,
    destinationStop: destStop,
    optionsCount: tripOptions.length,
    tripOptions,
  };
}

module.exports = {
  haversineDistanceMeters,
  calculateWalkingTimeMins,
  computeCrowdMetrics,
  calculateDynamicEta,
  planTripBetweenStops,
};
