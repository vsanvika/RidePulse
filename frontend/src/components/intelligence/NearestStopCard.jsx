import { MapPin, Footprints, ArrowUpRight } from "lucide-react";

export default function NearestStopCard({ nearestStop, onSelectStop }) {
  if (!nearestStop) return null;

  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 p-5 shadow-sm dark:border-indigo-900/50 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Nearest Campus Stop
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {nearestStop.name} ({nearestStop.code})
            </h4>
          </div>
        </div>

        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {nearestStop.distanceMeters} meters away
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-indigo-100 pt-3 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <Footprints className="h-4 w-4 text-indigo-600" />
          <span>Estimated walking time:</span>
          <strong className="text-slate-900 dark:text-white">
            ~{nearestStop.walkingTimeMins} mins walk
          </strong>
        </div>

        {onSelectStop && (
          <button
            onClick={() => onSelectStop(nearestStop)}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400"
          >
            <span>Plan From Here</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
