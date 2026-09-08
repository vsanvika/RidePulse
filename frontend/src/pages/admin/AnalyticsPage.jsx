import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminService";
import { routesApi, shuttlesApi } from "../../services/dataService";
import { BarChart3, Filter, Calendar, Bus, Navigation, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7days");
  const [selectedRoute, setSelectedRoute] = useState("ALL");
  const [selectedShuttle, setSelectedShuttle] = useState("ALL");

  const [routes, setRoutes] = useState([]);
  const [shuttles, setShuttles] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [resRoutes, resShuttles, resAnalytics] = await Promise.all([
          routesApi.getAll(),
          shuttlesApi.getAll(),
          adminApi.getAnalytics({ timeRange }),
        ]);

        if (resRoutes.success) setRoutes(resRoutes.data.routes || []);
        if (resShuttles.success) setShuttles(resShuttles.data.shuttles || []);
        if (resAnalytics.success) setAnalyticsData(resAnalytics.data);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [timeRange]);

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

  if (loading || !analyticsData) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-2" />
        <p className="text-xs font-bold">Compiling Fleet Intelligence Analytics...</p>
      </div>
    );
  }

  const {
    dailyRides = [],
    routeUsage = [],
    crowdByHour = [],
    shuttleOccupancy = [],
    waitingTimes = [],
    carbonSavings = [],
  } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transportation Intelligence Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive multi-metric fleet reporting & time series graphs
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Filter */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs">
            {[
              { id: "today", label: "Today" },
              { id: "7days", label: "7 Days" },
              { id: "30days", label: "30 Days" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`rounded-lg px-3 py-1.5 font-bold transition ${
                  timeRange === t.id
                    ? "bg-purple-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Route Filter */}
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="ALL">All Routes</option>
            {routes.map((r) => (
              <option key={r._id} value={r.routeId}>
                {r.routeId} - {r.name}
              </option>
            ))}
          </select>

          {/* Shuttle Filter */}
          <select
            value={selectedShuttle}
            onChange={(e) => setSelectedShuttle(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="ALL">All Shuttles</option>
            {shuttles.map((s) => (
              <option key={s._id} value={s.shuttleId}>
                Shuttle {s.shuttleId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid 1: Daily Rides & Route Usage */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Daily Rides Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            1. Daily Verified Rides Volume
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyRides}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="rides" fill="#6366f1" radius={[6, 6, 0, 0]} name="Completed Rides" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Route Usage Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            2. Campus Route Passenger Distribution (%)
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={routeUsage}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {routeUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2: Crowd by Hour & Shuttle Occupancy */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 3: Crowd by Hour Area Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            3. Hourly Crowd & Demand Intensity (%)
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={crowdByHour}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} unit="%" />
                <Tooltip />
                <Area type="monotone" dataKey="crowd" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} name="Crowd Density" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Shuttle Occupancy Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            4. Live Shuttle Capacity Utilization (%)
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shuttleOccupancy}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="shuttleId" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} unit="%" />
                <Tooltip />
                <Bar dataKey="occupancy" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Occupancy %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 3: Waiting Time & Carbon Savings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 5: Average Waiting Time Line Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            5. Average Student Waiting Time by Stop (mins)
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waitingTimes}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="stop" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={11} unit="m" />
                <Tooltip />
                <Line type="monotone" dataKey="avgWaitMins" stroke="#f59e0b" strokeWidth={3} name="Wait Time (mins)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Carbon Savings Area Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            6. Fleet CO₂ Carbon Offset Savings Trend (kg)
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={carbonSavings}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} unit=" kg" />
                <Tooltip />
                <Area type="monotone" dataKey="co2Saved" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="CO2 Saved (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
