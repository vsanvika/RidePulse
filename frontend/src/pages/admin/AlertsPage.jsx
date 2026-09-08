import { useEffect, useState } from "react";
import { alertsApi, routesApi } from "../../services/dataService";
import AlertManagementModal from "../../components/admin/AlertManagementModal";
import ServiceAlertsBanner from "../../components/alerts/ServiceAlertsBanner";
import { Bell, Trash2, ShieldAlert, Loader2 } from "lucide-react";

export default function AlertsPage() {
  const [routes, setRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlertsData = async () => {
    try {
      const [resR, resA] = await Promise.all([
        routesApi.getAll(),
        alertsApi.getAll(),
      ]);
      if (resR.success && resR.data?.routes) setRoutes(resR.data.routes);
      if (resA.success && resA.data?.alerts) setAlerts(resA.data.alerts);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await alertsApi.delete(id);
      fetchAlertsData();
    } catch (err) {
      console.error("Failed to delete alert", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Service Alerts Management
          </h1>
          <p className="text-xs text-slate-500">
            Publish, broadcast, and delete campus service advisories
          </p>
        </div>

        <AlertManagementModal routes={routes} onRefresh={fetchAlertsData} />
      </div>

      <ServiceAlertsBanner />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Published Service Advisories ({alerts.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-xs font-bold">Loading active alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No active alerts currently published.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                        alert.severity === "CRITICAL"
                          ? "bg-rose-600 text-white"
                          : alert.severity === "WARNING"
                          ? "bg-amber-500 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {alert.title}
                    </h4>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {alert.description || alert.message}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(alert._id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
