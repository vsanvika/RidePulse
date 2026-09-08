import { useEffect, useState } from "react";
import { driversApi, shuttlesApi } from "../../services/dataService";
import { UserCheck, Loader2 } from "lucide-react";

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [shuttles, setShuttles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const assignShuttle = async (driverId, shuttleId) => {
    setSavingId(driverId);
    try {
      const result = await driversApi.update(driverId, { assignedShuttle: shuttleId || null });
      if (result.success) {
        setDrivers((items) => items.map((driver) => driver._id === driverId ? result.data.driver : driver));
        const refreshed = await shuttlesApi.getAll();
        if (refreshed.success) setShuttles(refreshed.data.shuttles || []);
      } else {
        window.alert(result.message || "Unable to update assignment");
      }
    } catch (err) {
      window.alert(err.response?.data?.message || "Unable to update assignment");
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [resD, resS] = await Promise.all([
          driversApi.getAll(),
          shuttlesApi.getAll(),
        ]);
        if (resD.success && resD.data?.drivers) setDrivers(resD.data.drivers);
        if (resS.success && resS.data?.shuttles) setShuttles(resS.data.shuttles);
      } catch (err) {
        console.error("Failed to load drivers", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Drivers Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage campus shuttle drivers and vehicle assignments
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600 mb-2" />
            <p className="text-xs font-bold">Loading drivers list...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Driver Name</th>
                  <th className="py-3 px-3">License Number</th>
                  <th className="py-3 px-3">Assigned Shuttle</th>
                  <th className="py-3 px-3">Contact Email</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {drivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-slate-50 dark:hover:bg-slate-950/60 transition">
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                      {driver.user?.name || "Driver"}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-purple-600 dark:text-purple-400 font-bold">
                      {driver.licenseNumber}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <select
                          value={driver.assignedShuttle?._id || ""}
                          disabled={savingId === driver._id}
                          onChange={(event) => assignShuttle(driver._id, event.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                        >
                          <option value="">Unassigned</option>
                          {shuttles.map((shuttle) => {
                            const ownedByAnother = shuttle.driver && String(shuttle.driver._id || shuttle.driver) !== String(driver._id);
                            return <option key={shuttle._id} value={shuttle._id} disabled={ownedByAnother}>{`Shuttle ${shuttle.shuttleId}${ownedByAnother ? " (assigned)" : ""}`}</option>;
                          })}
                        </select>
                        {savingId === driver._id && <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {driver.user?.email || "N/A"}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                          driver.isActive
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {driver.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
