import { useState } from "react";
import { useSocketStore } from "../../store/socketStore";
import { Play, Pause, RotateCcw, Activity } from "lucide-react";

export default function SimulationControls() {
  const { simulationRunning, startSimulation, pauseSimulation, resetSimulation, triggerSimulationEvent } = useSocketStore();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    await startSimulation();
    setLoading(false);
  };

  const handlePause = async () => {
    setLoading(true);
    await pauseSimulation();
    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true);
    await resetSimulation();
    setLoading(false);
  };

  const handleEvent = async (action) => {
    setLoading(true);
    await triggerSimulationEvent(action);
    setLoading(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-purple-200 bg-purple-50/70 p-4 shadow-sm dark:border-purple-900/50 dark:bg-purple-950/40">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Campus Shuttle Simulation Control Engine
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Engine status:{" "}
            <span
              className={`font-semibold ${
                simulationRunning ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {simulationRunning ? "🟢 RUNNING (Broadcasting Socket.IO)" : "🟡 PAUSED"}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {simulationRunning ? (
          <button
            onClick={handlePause}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-amber-700 disabled:opacity-50"
          >
            <Pause className="h-4 w-4" />
            <span>Pause Simulation</span>
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            <span>Start Simulation</span>
          </button>
        )}

        <button
          onClick={handleReset}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Simulation</span>
        </button>

        <button onClick={() => handleEvent("DELAY")} disabled={loading} className="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700 disabled:opacity-50">Simulate Delay</button>
        <button onClick={() => handleEvent("BREAKDOWN")} disabled={loading} className="rounded-xl border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50">Simulate Breakdown</button>
        <button onClick={() => handleEvent("HIGH_CROWD")} disabled={loading} className="rounded-xl border border-orange-300 px-3 py-2 text-xs font-semibold text-orange-700 disabled:opacity-50">High Crowd</button>
        <button onClick={() => handleEvent("RECOVER")} disabled={loading} className="rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50">Recover Fleet</button>
      </div>
    </div>
  );
}
