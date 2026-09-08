import EmergencyAdminBanner from "../../components/safety/EmergencyAdminBanner";
import { ShieldAlert } from "lucide-react";

export default function EmergenciesPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Emergency Response Triage Console
        </h1>
        <p className="text-xs text-slate-500">
          Real-time stream of campus safety emergency reports and operator controls
        </p>
      </div>

      <EmergencyAdminBanner />
    </div>
  );
}
