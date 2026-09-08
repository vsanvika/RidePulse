import { Users } from "lucide-react";

export default function CrowdIndicator({ passengerCount = 0, capacity = 40, size = "md" }) {
  const percentage = Math.min(100, Math.round((passengerCount / capacity) * 100));

  let badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  let barColor = "bg-emerald-500";
  let label = "LOW";

  if (percentage > 75) {
    badgeColor = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    barColor = "bg-rose-500";
    label = "HIGH";
  } else if (percentage > 40) {
    badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    barColor = "bg-amber-500";
    label = "MEDIUM";
  }

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span>Occupancy</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-900 dark:text-white">
            {passengerCount} / {capacity} ({percentage}%)
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>
            {label}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
