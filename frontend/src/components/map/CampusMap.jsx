import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Center of campus (Hyderabad University mock coordinates)
const CAMPUS_CENTER = [17.4465, 78.3500];

// Custom HTML DivIcon for Shuttle Markers with dynamic pulse & status styling
function createShuttleIcon(shuttle) {
  const isDelayed = shuttle.status === "DELAYED";
  const isStopped = shuttle.status === "STOPPED" || shuttle.status === "OFFLINE";

  const color = shuttle.route?.color || "#2563EB";
  const statusColor = isDelayed ? "#F59E0B" : isStopped ? "#EF4444" : "#10B981";

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">
      <!-- Pulse Ring -->
      <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background-color: ${color}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <!-- Marker Card -->
      <div style="position: relative; z-index: 10; display: flex; items-center: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background-color: ${color}; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"/>
          <path d="M16 6v6"/>
          <path d="M2 12h20"/>
          <path d="M18 18h2"/>
          <path d="M4 18h2"/>
          <path d="M4 6h16a2 2 0 0 1 2 2v10H2V8a2 2 0 0 1 2-2Z"/>
        </svg>
      </div>
      <!-- Status Pill -->
      <div style="position: absolute; bottom: -2px; right: -2px; z-index: 20; width: 12px; height: 12px; border-radius: 50%; background-color: ${statusColor}; border: 2px solid white;"></div>
      <!-- Shuttle ID Label -->
      <div style="position: absolute; top: -14px; background: rgba(15, 23, 42, 0.85); color: white; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 4px; white-space: nowrap; backdrop-filter: blur(4px);">
        ${shuttle.shuttleId}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-shuttle-marker",
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

// Custom HTML DivIcon for Campus Stop Markers
function createStopIcon(stop) {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
      <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #4F46E5; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
        ${stop.code?.substring(0, 3) || "ST"}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-stop-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// Custom User Location Icon
const userLocationIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: #3B82F6; opacity: 0.35; animation: ping 1.5s infinite;"></div>
      <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #2563EB; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  className: "custom-user-marker",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Map controller to adjust view when shuttle is selected
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 1 });
    }
  }, [center, map]);
  return null;
}

export default function CampusMap({ shuttles = [], stops = [], routes = [], selectedShuttle = null, onSelectShuttle }) {
  const [userLocation] = useState([17.4458, 78.3530]); // Mock student location at Student Activity Center

  return (
    <div className="relative h-[550px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-800">
      <MapContainer
        center={CAMPUS_CENTER}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedShuttle?.currentLocation && (
          <MapRecenter
            center={[
              selectedShuttle.currentLocation.latitude,
              selectedShuttle.currentLocation.longitude,
            ]}
          />
        )}

        {/* 1. Draw Colored Route Polylines */}
        {routes.map((route) => {
          if (!route.stops || route.stops.length < 2) return null;
          const points = route.stops
            .filter((s) => s.location && s.location.latitude && s.location.longitude)
            .map((s) => [s.location.latitude, s.location.longitude]);

          if (points.length < 2) return null;

          return (
            <Polyline
              key={route._id || route.routeId}
              positions={points}
              pathOptions={{
                color: route.color || "#2563EB",
                weight: 4,
                opacity: 0.7,
                dashArray: "8, 6",
              }}
            />
          );
        })}

        {/* 2. Stop Markers */}
        {stops.map((stop) => {
          if (!stop.location || !stop.location.latitude || !stop.location.longitude) return null;
          return (
            <Marker
              key={stop._id || stop.stopId}
              position={[stop.location.latitude, stop.location.longitude]}
              icon={createStopIcon(stop)}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] text-white">
                      {stop.code}
                    </span>
                    <span>{stop.name}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Facilities: {stop.facilities?.join(", ") || "Standard Boarding"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 3. User Location Marker */}
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>
            <div className="p-1 text-xs font-semibold text-slate-800">
              📍 Your Location (Student Activity Center)
            </div>
          </Popup>
        </Marker>

        {/* 4. Live Shuttle Markers */}
        {shuttles.map((shuttle) => {
          if (!shuttle.currentLocation || !shuttle.currentLocation.latitude || !shuttle.currentLocation.longitude) {
            return null;
          }

          const pos = [shuttle.currentLocation.latitude, shuttle.currentLocation.longitude];

          return (
            <Marker
              key={shuttle._id || shuttle.shuttleId}
              position={pos}
              icon={createShuttleIcon(shuttle)}
              eventHandlers={{
                click: () => onSelectShuttle && onSelectShuttle(shuttle),
              }}
            >
              <Popup>
                <div className="w-56 p-1 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-slate-900 text-sm">{shuttle.shuttleId}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      shuttle.status === "ON_TIME" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {shuttle.status}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-slate-700">
                    <p><span className="font-semibold text-slate-500">Vehicle:</span> {shuttle.vehicleNumber}</p>
                    <p><span className="font-semibold text-slate-500">Route:</span> {shuttle.route?.name || "Unassigned"}</p>
                    <p><span className="font-semibold text-slate-500">Current Stop:</span> {shuttle.currentStop?.name || "En route"}</p>
                    <p><span className="font-semibold text-slate-500">Next Stop:</span> {shuttle.nextStop?.name || "Terminal"}</p>
                    <p><span className="font-semibold text-slate-500">ETA Next Stop:</span> ~{shuttle.eta || 2} mins</p>
                    <p><span className="font-semibold text-slate-500">Speed:</span> {shuttle.speed || 0} km/h</p>
                    <p><span className="font-semibold text-slate-500">Occupancy:</span> {shuttle.passengerCount || 0} / {shuttle.capacity || 40}</p>
                    <p><span className="font-semibold text-slate-500">Crowd Level:</span> <strong className="text-indigo-600">{shuttle.crowdLevel || "LOW"}</strong></p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
