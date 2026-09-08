import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import { useSocketStore } from "../../store/socketStore";
import { shuttlesApi, routesApi, stopsApi } from "../../services/dataService";
import { intelligenceApi } from "../../services/intelligenceService";
import CampusMap from "../../components/map/CampusMap";
import ShuttleDetailCard from "../../components/map/ShuttleDetailCard";
import NearestStopCard from "../../components/intelligence/NearestStopCard";
import TripPlannerWidget from "../../components/intelligence/TripPlannerWidget";
import CrowdIndicator from "../../components/intelligence/CrowdIndicator";
import CrowdPredictionChart from "../../components/analytics/CrowdPredictionChart";
import AIInsightsCard from "../../components/analytics/AIInsightsCard";
import ServiceAlertsBanner from "../../components/alerts/ServiceAlertsBanner";
import EmergencyModal from "../../components/safety/EmergencyModal";
import { Bus, Navigation, Radio, Compass, TrendingUp } from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const { initSocket, setInitialShuttles, shuttlesMap, isConnected } = useSocketStore();

  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [nearestStop, setNearestStop] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState("ALL");
  const [selectedShuttle, setSelectedShuttle] = useState(null);
  const [activeTab, setActiveTab] = useState("LIVE_MAP"); // LIVE_MAP | TRIP_PLANNER | PREDICTIONS

  useEffect(() => {
    initSocket();

    async function loadData() {
      try {
        const [resShuttles, resRoutes, resStops, resNearest] = await Promise.all([
          shuttlesApi.getAll(),
          routesApi.getAll(),
          stopsApi.getAll(),
          intelligenceApi.getNearestStops(17.4458, 78.3530).catch(() => null),
        ]);

        if (resShuttles?.success) setInitialShuttles(resShuttles.data.shuttles);
        if (resRoutes?.success) setRoutes(resRoutes.data.routes);
        if (resStops?.success) setStops(resStops.data.stops);
        if (resNearest?.success && resNearest.data?.nearestStops?.length > 0) {
          setNearestStop(resNearest.data.nearestStops[0]);
        }
      } catch (err) {
        console.error("Failed to load student dashboard intelligence data", err);
      }
    }

    loadData();
  }, []);

  const shuttlesList = useMemo(() => {
    const all = Object.values(shuttlesMap);
    if (selectedRouteId === "ALL") return all;
    return all.filter((s) => s.route?.routeId === selectedRouteId || s.route?._id === selectedRouteId);
  }, [shuttlesMap, selectedRouteId]);

  return (
    <div className="space-y-6 relative">
      {/* Floating Emergency SOS Modal Button */}
      <EmergencyModal shuttles={shuttlesList} />

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-300" />
              <span>Real-Time AI Campus Transit Intelligence</span>
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Campus Shuttle Intelligence & Live Tracking
            </h1>
            <p className="mt-1 text-sm text-indigo-100">
              Welcome back, {user?.name}! Live dynamic ETA, crowd prediction & safety features active.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-black/20 p-2.5 backdrop-blur">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? "bg-emerald-400 animate-ping" : "bg-amber-400"
              }`}
            />
            <span className="text-xs font-semibold">
              {isConnected ? "Live Socket Connected" : "Connecting Socket..."}
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveTab("LIVE_MAP")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "LIVE_MAP"
                ? "bg-white text-indigo-700 shadow"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Live Interactive Map</span>
          </button>

          <button
            onClick={() => setActiveTab("TRIP_PLANNER")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "TRIP_PLANNER"
                ? "bg-white text-indigo-700 shadow"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Navigation className="h-4 w-4" />
            <span>Smart Trip Planner ⭐</span>
          </button>

          <button
            onClick={() => setActiveTab("PREDICTIONS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "PREDICTIONS"
                ? "bg-white text-indigo-700 shadow"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Crowd Predictions & AI Insights</span>
          </button>
        </div>
      </div>

      {/* Nearest Stop Card Widget */}
      {nearestStop && (
        <NearestStopCard
          nearestStop={nearestStop}
          onSelectStop={() => setActiveTab("TRIP_PLANNER")}
        />
      )}

      {/* Tab 1: Live Interactive Map */}
      {activeTab === "LIVE_MAP" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Filter Route:
              </span>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="ALL">All Campus Routes ({shuttlesList.length} Shuttles)</option>
                {routes.map((r) => (
                  <option key={r._id} value={r.routeId}>
                    {r.routeId} - {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Active Fleet: <strong className="text-slate-900 dark:text-white">{shuttlesList.length} Shuttles</strong>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <CampusMap
                shuttles={shuttlesList}
                stops={stops}
                routes={routes}
                selectedShuttle={selectedShuttle}
                onSelectShuttle={(s) => setSelectedShuttle(s)}
              />

              {selectedShuttle && (
                <ShuttleDetailCard
                  shuttle={selectedShuttle}
                  onClose={() => setSelectedShuttle(null)}
                />
              )}
            </div>

            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Bus className="h-4 w-4 text-indigo-600" />
                <span>Active Shuttles ({shuttlesList.length})</span>
              </h3>

              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {shuttlesList.map((shuttle) => {
                  const isSelected = selectedShuttle?.shuttleId === shuttle.shuttleId;
                  const isBreakdown = shuttle.status === "BREAKDOWN";

                  return (
                    <div
                      key={shuttle._id || shuttle.shuttleId}
                      onClick={() => setSelectedShuttle(shuttle)}
                      className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition ${
                        isBreakdown
                          ? "border-rose-500 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/50 ring-1 ring-rose-500/50 animate-pulse"
                          : isSelected
                          ? "border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/60"
                          : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: shuttle.route?.color || "#2563EB" }}
                          />
                          <span className="font-bold text-slate-900 dark:text-white">
                            Shuttle {shuttle.shuttleId}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isBreakdown
                              ? "bg-rose-600 text-white"
                              : shuttle.status === "ON_TIME"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {shuttle.status}
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>Next: <strong className="text-slate-800 dark:text-slate-200">{shuttle.nextStop?.name || "Terminus"}</strong></span>
                          <span>ETA: <strong className="text-indigo-600 dark:text-indigo-400">~{shuttle.eta || 2} mins</strong></span>
                        </div>

                        <CrowdIndicator
                          passengerCount={shuttle.passengerCount || 0}
                          capacity={shuttle.capacity || 40}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Smart Trip Planner */}
      {activeTab === "TRIP_PLANNER" && (
        <div className="max-w-3xl mx-auto">
          <TripPlannerWidget stops={stops} preselectedOrigin={nearestStop} />
        </div>
      )}

      {/* Tab 3: Predictions & AI Insights */}
      {activeTab === "PREDICTIONS" && (
        <div className="space-y-6">
          <CrowdPredictionChart routes={routes} />
          <AIInsightsCard />
        </div>
      )}

      {/* Bottom Service & Route Alerts */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Active Campus Service & Route Alerts
        </h3>
        <ServiceAlertsBanner />
      </div>
    </div>
  );
}
