import { useState } from "react";
import { intelligenceApi } from "../../services/intelligenceService";
import CrowdIndicator from "./CrowdIndicator";
import { Navigation, ArrowRight, Bus, Star, ShieldAlert, Loader2, Info } from "lucide-react";

export default function TripPlannerWidget({ stops = [], preselectedOrigin = null }) {
  const [originStopId, setOriginStopId] = useState(preselectedOrigin?._id || stops[0]?._id || "");
  const [destinationStopId, setDestinationStopId] = useState(stops[1]?._id || "");
  const [planResult, setPlanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlan = async (e) => {
    e?.preventDefault();
    if (!originStopId || !destinationStopId) return;

    if (originStopId === destinationStopId) {
      setError("Origin and destination stops must be different.");
      setPlanResult(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await intelligenceApi.planTrip(originStopId, destinationStopId);
      if (res.success) {
        setPlanResult(res.data);
      } else {
        setError(res.message || "No available trips found.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to calculate trip options.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <Navigation className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Smart Campus Trip Planner & AI Recommendation
          </h3>
          <p className="text-xs text-slate-500">
            Select origin and destination to get AI-scored shuttle recommendations
          </p>
        </div>
      </div>

      <form onSubmit={handlePlan} className="mt-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {/* From Stop */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              From Stop (Origin)
            </label>
            <select
              value={originStopId}
              onChange={(e) => setOriginStopId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {stops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* To Stop */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              To Stop (Destination)
            </label>
            <select
              value={destinationStopId}
              onChange={(e) => setDestinationStopId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {stops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Calculating Optimal Trips...</span>
            </>
          ) : (
            <>
              <span>Find Best Routes & AI Recommended Shuttle</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Plan Results */}
      {planResult && (
        <div className="mt-6 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Available Connecting Shuttles ({planResult.optionsCount})</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              {planResult.originStop?.name} → {planResult.destinationStop?.name}
            </span>
          </div>

          {planResult.optionsCount === 0 ? (
            <p className="text-xs text-slate-500">
              No active shuttles currently on routes connecting these stops.
            </p>
          ) : (
            <div className="space-y-3">
              {planResult.tripOptions.map((option, idx) => {
                const isRec = option.isRecommended;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 shadow-sm transition ${
                      isRec
                        ? "border-amber-400 bg-amber-50/60 dark:border-amber-600 dark:bg-amber-950/40 ring-1 ring-amber-400/50"
                        : "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    {isRec && (
                      <div className="mb-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                          <Star className="h-3 w-3 fill-white" /> ⭐ Recommended Choice
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          AI Rank #1 (Score: {option.recommendationScore})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold text-xs shadow-sm"
                          style={{ backgroundColor: option.route.color || "#2563EB" }}
                        >
                          <Bus className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Shuttle {option.shuttle.shuttleId} ({option.route.name})
                          </h4>
                          <p className="text-[10px] text-slate-500">{option.shuttle.vehicleNumber}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          Boarding in ~{option.boardingEtaMinutes} mins
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Est. Arrival: {option.expectedArrivalFormatted}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <CrowdIndicator
                        passengerCount={option.crowd.passengerCount}
                        capacity={option.crowd.capacity}
                      />
                    </div>

                    {isRec && option.recommendationReason && (
                      <div className="mt-3 flex items-start gap-1.5 rounded-xl bg-amber-100/70 p-2.5 text-[11px] font-semibold text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-200 dark:border-amber-900">
                        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{option.recommendationReason}</span>
                      </div>
                    )}

                    {option.shuttle.status === "DELAYED" && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>{option.delay}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
