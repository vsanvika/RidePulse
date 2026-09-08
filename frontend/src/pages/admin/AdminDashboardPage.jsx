import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../services/adminService";
import { useAuthStore } from "../../store/authStore";
import { useSocketStore } from "../../store/socketStore";
import { shuttlesApi, routesApi, stopsApi, alertsApi } from "../../services/dataService";
import SimulationControls from "../../components/admin/SimulationControls";
import CampusMap from "../../components/map/CampusMap";
import EmergencyAdminBanner from "../../components/safety/EmergencyAdminBanner";
import ServiceAlertsBanner from "../../components/alerts/ServiceAlertsBanner";
import AlertManagementModal from "../../components/admin/AlertManagementModal";
import {
  Bus,
  Users,
  Clock,
  AlertTriangle,
  Flame,
  Bell,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Wrench,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { initSocket, setInitialShuttles, shuttlesMap } = useSocketStore();

  const [metrics, setMetrics] = useState({
    activeShuttles: 0,
    totalStudents: 0,
    todaysRides: 0,
    delayedShuttles: 0,
    highCrowdRoutes: 0,
    openAlerts: 0,
  });

  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShuttle, setSelectedShuttle] = useState(null);

  const loadDashboardData = async () => {
    try {
      const [resMetrics, resStops, resRoutes, resShuttles] = await Promise.all([
        adminApi.getMetrics().catch(() => null),
        stopsApi.getAll(),
        routesApi.getAll(),
        shuttlesApi.getAll().catch(() => ({ data: { count: 0, shuttles: [] } })),
      ]);

      if (resMetrics?.success && resMetrics.data) {
        setMetrics(resMetrics.data);
      }

      if (resShuttles?.success) setInitialShuttles(resShuttles.data.shuttles);
      if (resRoutes?.success) setRoutes(resRoutes.data.routes);
      if (resStops?.success) setStops(resStops.data.stops);
    } catch (_err) {
      console.error("Failed to load dashboard metrics", _err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSocket();
    loadDashboardData();
  }, []);

  const shuttlesList = Object.values(shuttlesMap);

  const handleResolveBreakdown = async (shuttleIdMongo) => {
    try {
      await shuttlesApi.resolveBreakdown(shuttleIdMongo);
      loadDashboardData();
    } catch (err) {
      console.error("Failed to resolve breakdown", err);
    }
  };

  const handleDisableShuttle = async (shuttleIdMongo) => {
    try {
      await shuttlesApi.disable(shuttleIdMongo);
      loadDashboardData();
    } catch (err) {
      console.error("Failed to disable shuttle", err);
    }
  };

  const handleNotifyStudentsBreakdown = async (shuttleIdCode) => {
    try {
      await alertsApi.create({
        title: `CRITICAL BREAKDOWN: Shuttle ${shuttleIdCode}`,
        description: `Shuttle ${shuttleIdCode} has experienced a technical malfunction. Replacement vehicle dispatched.`,
        severity: "CRITICAL",
      });
    } catch (err) {
      console.error("Failed to publish breakdown alert", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Emergency Triage Banner */}
      <EmergencyAdminBanner />

      {/* Broadcast Service Alerts Banner */}
      <ServiceAlertsBanner />

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-200" />
              <span>Real-Time Fleet & Operations Control</span>
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Professional Fleet Overview & Analytics
            </h1>
            <p className="mt-1 text-sm text-purple-100">
              Welcome back, {user?.name}! Live database metrics updated.
            </p>
          </div>

          <AlertManagementModal routes={routes} onRefresh={loadDashboardData} />
        </div>
      </div>

      {/* Breakdown Notification Bar if any shuttle is in BREAKDOWN */}
      {shuttlesList.some((s) => s.status === "BREAKDOWN") && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
          <h3 className="flex items-center gap-2 text-sm font-bold text-rose-800 dark:text-rose-200">
            <Wrench className="h-4 w-4 animate-spin text-rose-600" />
            <span>ATTENTION: Vehicle Breakdown Flagged</span>
          </h3>

          <div className="mt-3 space-y-2">
            {shuttlesList
              .filter((s) => s.status === "BREAKDOWN")
              .map((shuttle) => (
                <div
                  key={shuttle._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-white p-3 shadow-sm dark:border-rose-900 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] text-white">
                      POSSIBLE BREAKDOWN
                    </span>
                    <span>Shuttle {shuttle.shuttleId} ({shuttle.vehicleNumber})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveBreakdown(shuttle._id)}
                      className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                    >
                      Resolve Breakdown
                    </button>
                    <button
                      onClick={() => handleDisableShuttle(shuttle._id)}
                      className="rounded-lg bg-slate-700 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-800"
                    >
                      Disable Shuttle
                    </button>
                    <button
                      onClick={() => handleNotifyStudentsBreakdown(shuttle.shuttleId)}
                      className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                    >
                      Notify Students
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Simulation Controls Component */}
      <SimulationControls />

      {/* 6 Real Database Powered Cards (NO Hardcoded Values) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Active Shuttles */}
        <Link
          to="/admin/shuttles"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-purple-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-800"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Bus className="h-6 w-6" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-purple-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-purple-600" /> : metrics.activeShuttles}
          </p>
          <p className="text-xs font-bold text-slate-500">Active Fleet Shuttles</p>
        </Link>

        {/* Card 2: Total Students */}
        <Link
          to="/admin/students"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-indigo-600" /> : metrics.totalStudents}
          </p>
          <p className="text-xs font-bold text-slate-500">Total Registered Students</p>
        </Link>

        {/* Card 3: Today's Rides */}
        <Link
          to="/admin/analytics"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Clock className="h-6 w-6" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-emerald-600" /> : metrics.todaysRides}
          </p>
          <p className="text-xs font-bold text-slate-500">Today's Verified Rides</p>
        </Link>

        {/* Card 4: Delayed Shuttles */}
        <Link
          to="/admin/shuttles"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-800"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-amber-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-amber-600" /> : metrics.delayedShuttles}
          </p>
          <p className="text-xs font-bold text-slate-500">Delayed Shuttles Flagged</p>
        </Link>

        {/* Card 5: High Crowd Routes */}
        <Link
          to="/admin/routes"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-rose-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-800"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-rose-100 p-3 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <Flame className="h-6 w-6" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-rose-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-rose-600" /> : metrics.highCrowdRoutes}
          </p>
          <p className="text-xs font-bold text-slate-500">High Crowd Shuttles/Routes</p>
        </Link>

        {/* Card 6: Open Alerts */}
        <Link
          to="/admin/alerts"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Bell className="h-6 w-6" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> : metrics.openAlerts}
          </p>
          <p className="text-xs font-bold text-slate-500">Active Service Alerts</p>
        </Link>
      </div>

      {/* Live Campus Map Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Live Campus Shuttle Fleet Tracking Monitor
        </h3>
        <CampusMap
          shuttles={shuttlesList}
          stops={stops}
          routes={routes}
          selectedShuttle={selectedShuttle}
          onSelectShuttle={(s) => setSelectedShuttle(s)}
        />
      </div>
    </div>
  );
}
