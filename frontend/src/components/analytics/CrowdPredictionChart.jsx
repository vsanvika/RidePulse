import { useEffect, useState } from "react";
import { predictionApi } from "../../services/predictionService";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Clock, AlertCircle, Loader2 } from "lucide-react";

export default function CrowdPredictionChart({ routes = [] }) {
  const [selectedRouteId, setSelectedRouteId] = useState("R01");
  const [predictionData, setPredictionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrediction() {
      setLoading(true);
      try {
        const res = await predictionApi.getCrowdPrediction(selectedRouteId);
        if (res.success && res.data?.predictionPoints) {
          setPredictionData(res.data.predictionPoints);
        }
      } catch (err) {
        console.error("Failed to load crowd predictions", err);
      } finally {
        setLoading(false);
      }
    }

    loadPrediction();
  }, [selectedRouteId]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            Time: {label} {data.isPeakHour && "🔥 (Peak Hour)"}
          </p>
          <div className="mt-1 space-y-1 text-[11px]">
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Predicted Occupancy: {data.occupancyPercentage}%
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Est. Passengers: {data.predictedPassengers} / {data.capacity}
            </p>
            <p className="font-bold text-purple-600 dark:text-purple-400">
              Expected Crowd: {data.crowdLevel}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Crowd Density Forecasting
            </h3>
            <p className="text-xs text-slate-500">
              Predicted passenger occupancy by time slot based on historical peak trends
            </p>
          </div>
        </div>

        {/* Route Selector */}
        <select
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          {routes.length > 0 ? (
            routes.map((r) => (
              <option key={r._id} value={r.routeId}>
                {r.routeId} - {r.name}
              </option>
            ))
          ) : (
            <>
              <option value="R01">R01 - Express Loop</option>
              <option value="R02">R02 - Academic Line</option>
              <option value="R03">R03 - Hostel Express</option>
              <option value="R04">R04 - Research Corridor</option>
            </>
          )}
        </select>
      </div>

      {/* Chart */}
      <div className="mt-5 h-[280px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            <span>Calculating predictive model...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={predictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="crowdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="timeSlot" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={75} label={{ value: "High Crowd Threshold (75%)", fill: "#EF4444", fontSize: 10 }} stroke="#EF4444" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="occupancyPercentage"
                stroke="#7C3AED"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#crowdGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-600" />
          <span>Occupancy Trend</span>
          <span className="ml-2 h-2 w-2 rounded-full bg-red-500" />
          <span>Peak Hour Windows (8:30-9:30 AM & 5:00-6:00 PM)</span>
        </div>
        <span className="font-semibold text-purple-600 dark:text-purple-400">
          Model: Time-series Moving Average
        </span>
      </div>
    </div>
  );
}
