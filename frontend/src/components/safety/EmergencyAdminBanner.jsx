import { useEffect, useState } from "react";
import { emergencyApi } from "../../services/emergencyService";
import { useSocketStore } from "../../store/socketStore";
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Phone, User } from "lucide-react";

export default function EmergencyAdminBanner() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocketStore((state) => state.socket);

  const fetchReports = async () => {
    try {
      const res = await emergencyApi.getAll();
      if (res.success && res.data?.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error("Failed to load emergency reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    if (!socket) return;

    const handleNewEmergency = (report) => {
      setReports((prev) => [report, ...prev]);
    };

    const handleUpdateEmergency = (updated) => {
      setReports((prev) =>
        prev.map((r) => (r._id === updated._id ? { ...r, ...updated } : r))
      );
    };

    socket.on("emergency:new", handleNewEmergency);
    socket.on("emergency:update", handleUpdateEmergency);

    return () => {
      socket.off("emergency:new", handleNewEmergency);
      socket.off("emergency:update", handleUpdateEmergency);
    };
  }, [socket]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await emergencyApi.updateStatus(id, newStatus);
      if (res.success) {
        setReports((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error("Failed to update emergency status", err);
    }
  };

  const activeReports = reports.filter((r) => r.status !== "RESOLVED");

  if (loading || activeReports.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-rose-500 bg-rose-50/90 p-5 shadow-xl dark:border-rose-800 dark:bg-rose-950/60 animate-pulse-subtle">
      <div className="flex items-center justify-between border-b border-rose-200 pb-3 dark:border-rose-900">
        <div className="flex items-center gap-3 text-rose-700 dark:text-rose-300">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow animate-bounce">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight">
              CRITICAL EMERGENCY ALERTS ({activeReports.length} ACTIVE)
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Immediate operator action required. Real-time broadcast from student SOS network.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {activeReports.map((report) => (
          <div
            key={report._id}
            className="rounded-xl border border-rose-200 bg-white p-4 shadow-sm dark:border-rose-900 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                  {report.category}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {report.location?.landmark || "Campus Stop"} {report.shuttleId !== "N/A" && `(Shuttle ${report.shuttleId})`}
                </span>
              </div>

              {/* Status Controller */}
              <div className="flex items-center gap-1">
                {["PENDING", "INVESTIGATING", "RESOLVED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(report._id, st)}
                    className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                      report.status === st
                        ? st === "RESOLVED"
                          ? "bg-emerald-600 text-white"
                          : st === "INVESTIGATING"
                          ? "bg-amber-600 text-white"
                          : "bg-rose-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              "{report.description}"
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {report.reportedBy?.name || "Student"} ({report.reportedBy?.email})
              </span>
              {report.reportedBy?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {report.reportedBy.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {new Date(report.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
