import { useEffect, useState } from "react";
import { useSocketStore } from "../../store/socketStore";
import { shuttlesApi, alertsApi } from "../../services/dataService";
import { Wrench, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

export default function BreakdownsPage() {
  const { initSocket, setInitialShuttles, shuttlesMap } = useSocketStore();

  useEffect(() => {
    initSocket();
    shuttlesApi.getAll().then((res) => {
      if (res.success) setInitialShuttles(res.data.shuttles);
    });
  }, []);

  const shuttlesList = Object.values(shuttlesMap);
  const breakdownShuttles = shuttlesList.filter((s) => s.status === "BREAKDOWN" || s.status === "DELAYED");

  const handleResolveBreakdown = async (shuttleIdMongo) => {
    try {
      await shuttlesApi.resolveBreakdown(shuttleIdMongo);
    } catch (err) {
      console.error("Failed to resolve breakdown", err);
    }
  };

  const handleDisableShuttle = async (shuttleIdMongo) => {
    try {
      await shuttlesApi.disable(shuttleIdMongo);
    } catch (err) {
      console.error("Failed to disable shuttle", err);
    }
  };

  const handleNotifyStudents = async (shuttleIdCode) => {
    try {
      await alertsApi.create({
        title: `CRITICAL BREAKDOWN: Shuttle ${shuttleIdCode}`,
        description: `Shuttle ${shuttleIdCode} has experienced a technical malfunction and is temporarily taken offline. Alternate shuttles dispatched.`,
        severity: "CRITICAL",
      });
    } catch (err) {
      console.error("Failed to publish breakdown alert", err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Vehicle Breakdown Detection & Control
        </h1>
        <p className="text-xs text-slate-500">
          Automated simulation breakdown detector and fleet intervention controls
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wrench className="h-5 w-5 text-amber-600" />
          <span>Flagged Vehicle Incidents ({breakdownShuttles.length})</span>
        </h3>

        {breakdownShuttles.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-800 dark:text-slate-200">All Shuttles Operational</p>
            <p>No active vehicle breakdowns or major delays detected.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {breakdownShuttles.map((shuttle) => (
              <div
                key={shuttle._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900 dark:bg-rose-950/40"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-rose-600 animate-bounce" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        Shuttle {shuttle.shuttleId} ({shuttle.vehicleNumber})
                      </span>
                      <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white">
                        {shuttle.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Stopped near: {shuttle.nextStop?.name || "Campus Road"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolveBreakdown(shuttle._id)}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                  >
                    Resolve Breakdown
                  </button>
                  <button
                    onClick={() => handleDisableShuttle(shuttle._id)}
                    className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-900"
                  >
                    Disable Shuttle
                  </button>
                  <button
                    onClick={() => handleNotifyStudents(shuttle.shuttleId)}
                    className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                  >
                    Notify Students
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
