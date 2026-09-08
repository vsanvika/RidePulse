import { useEffect, useState } from "react";
import { alertsApi } from "../../services/dataService";
import { useSocketStore } from "../../store/socketStore";
import { AlertCircle, ShieldAlert, Info, BellRing, Clock, Bus } from "lucide-react";

export default function ServiceAlertsBanner() {
  const [alerts, setAlerts] = useState([]);
  const socket = useSocketStore((state) => state.socket);

  const fetchAlerts = async () => {
    try {
      const res = await alertsApi.getAll();
      if (res.success && res.data?.alerts) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error("Failed to load service alerts", err);
    }
  };

  useEffect(() => {
    fetchAlerts();

    if (!socket) return;

    const handleNewAlert = (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    };

    const handleDeleteAlert = ({ _id }) => {
      setAlerts((prev) => prev.filter((a) => a._id !== _id));
    };

    socket.on("alert:new", handleNewAlert);
    socket.on("alert:delete", handleDeleteAlert);

    return () => {
      socket.off("alert:new", handleNewAlert);
      socket.off("alert:delete", handleDeleteAlert);
    };
  }, [socket]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const isCritical = alert.severity === "CRITICAL";
        const isWarning = alert.severity === "WARNING";

        return (
          <div
            key={alert._id}
            className={`rounded-2xl border p-4 shadow-sm transition ${
              isCritical
                ? "border-rose-500 bg-rose-50/90 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200 animate-pulse-subtle"
                : isWarning
                ? "border-amber-400 bg-amber-50/90 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                : "border-blue-300 bg-blue-50/90 text-blue-900 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {isCritical ? (
                    <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 animate-bounce" />
                  ) : isWarning ? (
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wide">
                      {alert.title}
                    </h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                        isCritical
                          ? "bg-rose-600 text-white"
                          : isWarning
                          ? "bg-amber-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {alert.severity} ALERT
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-relaxed opacity-90">
                    {alert.description || alert.message}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[10px] opacity-80">
                    {alert.route && (
                      <span className="flex items-center gap-1 font-bold">
                        <Bus className="h-3 w-3" /> Route: {alert.route.name || alert.route.routeId}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Posted: {new Date(alert.createdAt || alert.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
