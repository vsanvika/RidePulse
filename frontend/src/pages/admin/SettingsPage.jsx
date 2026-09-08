import { useState } from "react";
import SimulationControls from "../../components/admin/SimulationControls";
import { Settings, Sliders, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { adminApi } from "../../services/adminService";

export default function SettingsPage() {
  const [breakdownInterval, setBreakdownInterval] = useState(15);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      const settings = res.data?.settings;
      if (settings) {
        setBreakdownInterval(settings.breakdownTimeoutSeconds);
        setSpeedMultiplier(settings.speedMultiplier);
      }
    }).catch(() => {});
  }, []);

  const saveSettings = async () => {
    const res = await adminApi.updateSettings({ breakdownTimeoutSeconds: breakdownInterval, speedMultiplier });
    setMessage(res.message || "Settings saved");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System & Simulation Settings
        </h1>
        <p className="text-xs text-slate-500">
          Configure real-time simulation parameters and breakdown detection thresholds
        </p>
      </div>

      <SimulationControls />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="h-5 w-5 text-purple-600" />
          <span>Breakdown Detection Thresholds</span>
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Breakdown Detection Timeout (Seconds)
            </label>
            <input
              type="number"
              value={breakdownInterval}
              onChange={(e) => setBreakdownInterval(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Flags POSSIBLE BREAKDOWN if shuttle stops moving for this duration.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Simulation Movement Speed Multiplier
            </label>
            <input
              type="number"
              step="0.5"
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Controls speed of simulated shuttles along route lines.
            </p>
          </div>
        </div>
        <button onClick={saveSettings} className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white">Save settings</button>
        {message && <span className="ml-3 text-xs font-semibold text-emerald-600">{message}</span>}
      </div>
    </div>
  );
}
