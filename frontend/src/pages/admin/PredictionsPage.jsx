import CrowdPredictionChart from "../../components/analytics/CrowdPredictionChart";
import { BrainCircuit, Sparkles } from "lucide-react";

export default function PredictionsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          AI Crowd Predictions & Transportation Insights
        </h1>
        <p className="text-xs text-slate-500">
          Machine Learning crowd forecasting and automated dispatch recommendations
        </p>
      </div>

      {/* AI Fleet Insights Box */}
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-6 dark:border-purple-900 dark:from-purple-950/40 dark:to-indigo-950/40 space-y-3">
        <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
          <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
          <span>Automated AI Fleet Insights</span>
        </div>

        <div className="space-y-2 text-xs text-purple-800 dark:text-purple-300 font-medium">
          <p>• "Academic Route experiences peak demand between 8:30 AM and 9:15 AM."</p>
          <p>• "Shuttle S02 operates at 92% capacity during morning peak; consider re-dispatching S04."</p>
          <p>• "Library Stop exhibits highest student wait times on Wednesday afternoons."</p>
        </div>
      </div>

      <CrowdPredictionChart />
    </div>
  );
}
