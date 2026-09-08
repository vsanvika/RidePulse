import { motion } from "framer-motion";
import { Bus, MapPin, Gauge, Users, Clock, AlertTriangle, ShieldCheck, X } from "lucide-react";

export default function ShuttleDetailCard({ shuttle, onClose }) {
  if (!shuttle) return null;

  const isDelayed = shuttle.status === "DELAYED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
          style={{ backgroundColor: shuttle.route?.color || "#2563EB" }}
        >
          <Bus className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Shuttle {shuttle.shuttleId}
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                isDelayed
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              }`}
            >
              {shuttle.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vehicle No: {shuttle.vehicleNumber}
          </p>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        {/* Route */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Route</span>
          <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
            {shuttle.route?.name || "Unassigned"}
          </p>
        </div>

        {/* Current Stop */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Current Stop</span>
          <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-200 truncate">
            {shuttle.currentStop?.name || "Boarding..."}
          </p>
        </div>

        {/* Next Stop */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Next Stop</span>
          <p className="mt-0.5 font-bold text-purple-600 dark:text-purple-400 truncate">
            {shuttle.nextStop?.name || "Terminus"}
          </p>
        </div>

        {/* ETA */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">ETA</span>
          <p className="mt-0.5 font-bold text-indigo-600 dark:text-indigo-400">
            ~{shuttle.eta || 2} mins
          </p>
        </div>

        {/* Speed */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Speed</span>
          <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
            {shuttle.speed || 0} km/h
          </p>
        </div>

        {/* Passengers */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Occupancy</span>
          <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
            {shuttle.passengerCount || 0} / {shuttle.capacity || 40}
          </p>
        </div>

        {/* Crowd Level */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Crowd Level</span>
          <p className="mt-0.5 font-bold text-indigo-600 dark:text-indigo-400">
            {shuttle.crowdLevel || "LOW"}
          </p>
        </div>

        {/* Status */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Live Status</span>
          <p className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
            {shuttle.status}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
