import { useEffect, useState } from "react";
import { predictionApi } from "../../services/predictionService";
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle2, Loader2 } from "lucide-react";

export default function AIInsightsCard() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await predictionApi.getInsights();
        if (res.success && res.data?.insights) {
          setInsights(res.data.insights);
        }
      } catch (err) {
        console.error("Failed to load AI insights", err);
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, []);

  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/60 p-5 shadow-sm dark:border-indigo-900/50 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-indigo-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Operational Fleet Insights
            </h3>
            <p className="text-xs text-slate-500">
              Derived dynamically from live shuttle utilization & historical routes
            </p>
          </div>
        </div>

        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          Real-Time Analysis
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center p-6 text-xs text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 mr-2" />
            <span>Analyzing network data...</span>
          </div>
        ) : insights.length === 0 ? (
          <p className="text-xs text-slate-500">No operational warnings generated.</p>
        ) : (
          insights.map((item) => {
            const isHigh = item.severity === "HIGH";
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isHigh ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Lightbulb className="h-4 w-4 text-indigo-500" />
                    )}
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isHigh
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    }`}
                  >
                    {item.severity} SEVERITY
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-indigo-50/70 p-2 text-[11px] font-semibold text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-200">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Recommendation: {item.recommendation}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
