import { useEffect, useState } from "react";
import { sustainabilityApi } from "../../services/sustainabilityService";
import { Leaf, Award, TrendingUp, Bus, Info, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SustainabilityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await sustainabilityApi.getStats();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to load sustainability metrics", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-2" />
        <p className="text-xs font-bold">Calculating Carbon Offset Metrics...</p>
      </div>
    );
  }

  const {
    totalRides = 0,
    weeklySavingsKg = 0,
    monthlySavingsKg = 0,
    totalCo2SavedKg = 0,
    treesPlantedEquivalent = 0,
    monthlyTrends = [],
    assumptions = {},
  } = data || {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Leaf className="h-3.5 w-3.5 text-emerald-200" />
              <span>Campus Sustainability & Eco-Tracker</span>
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              CO₂ Carbon Offset & Savings Dashboard
            </h1>
            <p className="mt-1 text-sm text-emerald-100">
              Track your environmental impact by riding green shared campus shuttles
            </p>
          </div>

          <div className="rounded-2xl bg-black/20 p-4 text-center backdrop-blur">
            <span className="text-3xl font-black text-emerald-300">🌳 {treesPlantedEquivalent}</span>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-100">
              Trees Equivalent
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <Bus className="h-6 w-6" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Lifetime</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalRides} Rides
          </p>
          <p className="text-xs font-semibold text-slate-500">Total Shuttles Boarded</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <Leaf className="h-6 w-6" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Weekly</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {weeklySavingsKg} kg
          </p>
          <p className="text-xs font-semibold text-slate-500">CO₂ Saved This Week</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400">
            <TrendingUp className="h-6 w-6" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Monthly</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-teal-600 dark:text-teal-400">
            {monthlySavingsKg} kg
          </p>
          <p className="text-xs font-semibold text-slate-500">CO₂ Saved This Month</p>
        </div>

        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
            <Award className="h-6 w-6" />
            <span className="text-[10px] uppercase font-extrabold text-emerald-800 dark:text-emerald-200">Total Offset</span>
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {totalCo2SavedKg} kg
          </p>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Total Lifetime CO₂ Saved</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly CO₂ Offset Trend (kg)
            </h3>
            <p className="text-xs text-slate-500">
              Estimated greenhouse gas reduction based on your shuttle commute frequency
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} unit=" kg" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="co2SavedKg" fill="#10b981" radius={[8, 8, 0, 0]} name="CO2 Saved (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clearly Documented Mock Assumptions Box */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Info className="h-5 w-5 text-emerald-600" />
          <span>Documented Emissions Calculation Assumptions</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="rounded-xl bg-white p-3.5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200">Solo Car / Cab Emissions:</span>
            <p className="mt-0.5 font-mono text-emerald-600 dark:text-emerald-400">
              {assumptions.soloCarEmissionsGPerKm || 170}g CO₂ per kilometer
            </p>
          </div>

          <div className="rounded-xl bg-white p-3.5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200">Shared Campus Shuttle Emissions:</span>
            <p className="mt-0.5 font-mono text-emerald-600 dark:text-emerald-400">
              {assumptions.shuttleEmissionsGPerKm || 40}g CO₂ per passenger-km
            </p>
          </div>

          <div className="rounded-xl bg-white p-3.5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200">Average Campus Route Length:</span>
            <p className="mt-0.5 font-mono text-emerald-600 dark:text-emerald-400">
              {assumptions.avgTripDistanceKm || 3.5} km per trip
            </p>
          </div>

          <div className="rounded-xl bg-white p-3.5 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200">Net Offset per Shuttle Ride:</span>
            <p className="mt-0.5 font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
              ~{assumptions.co2SavedPerRideKg || 0.455} kg CO₂ saved / ride
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
