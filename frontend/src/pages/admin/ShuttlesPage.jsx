import { useEffect, useState } from "react";
import { shuttlesApi, routesApi, driversApi } from "../../services/dataService";
import { Plus, Trash2, Edit2, Loader2, RefreshCw, Bus } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function ShuttlesPage() {
  const [shuttles, setShuttles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingShuttle, setEditingShuttle] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    shuttleId: "",
    vehicleNumber: "",
    capacity: 40,
    route: "",
    driver: "",
    status: "ON_TIME",
    crowdLevel: "LOW",
    passengerCount: 0,
    speed: 0,
  });

  const setToast = useAuthStore((state) => state.setToast);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resS, resR, resD] = await Promise.all([
        shuttlesApi.getAll(),
        routesApi.getAll(),
        driversApi.getAll().catch(() => ({ success: false, data: { drivers: [] } })),
      ]);
      if (resS.success) setShuttles(resS.data.shuttles);
      if (resR.success) setRoutes(resR.data.routes);
      if (resD.success) setDrivers(resD.data.drivers);
    } catch (_err) {
      setToast("Failed to load shuttles data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingShuttle(null);
    setFormData({
      shuttleId: `S0${shuttles.length + 1}`,
      vehicleNumber: `TS-09-UB-100${shuttles.length + 1}`,
      capacity: 40,
      route: routes[0]?._id || "",
      driver: "",
      status: "ON_TIME",
      crowdLevel: "LOW",
      passengerCount: 0,
      speed: 0,
    });
    setShowForm(true);
  };

  const handleOpenEdit = (shuttle) => {
    setEditingShuttle(shuttle);
    setFormData({
      shuttleId: shuttle.shuttleId,
      vehicleNumber: shuttle.vehicleNumber,
      capacity: shuttle.capacity || 40,
      route: shuttle.route?._id || shuttle.route || "",
      driver: shuttle.driver?._id || shuttle.driver || "",
      status: shuttle.status || "ON_TIME",
      crowdLevel: shuttle.crowdLevel || "LOW",
      passengerCount: shuttle.passengerCount || 0,
      speed: shuttle.speed || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shuttle?")) return;
    try {
      await shuttlesApi.delete(id);
      setToast("Shuttle deleted successfully");
      loadData();
    } catch (_err) {
      setToast("Failed to delete shuttle");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      passengerCount: Number(formData.passengerCount),
      speed: Number(formData.speed),
      route: formData.route || null,
      driver: formData.driver || null,
    };

    try {
      if (editingShuttle) {
        await shuttlesApi.update(editingShuttle._id, payload);
        setToast("Shuttle updated successfully");
      } else {
        await shuttlesApi.create(payload);
        setToast("Shuttle created successfully");
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to save shuttle");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Shuttle Fleet Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Monitor, assign, and manage campus shuttle vehicles and statuses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Shuttle</span>
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-purple-200 bg-purple-50/50 p-6 shadow-md dark:border-purple-900/50 dark:bg-purple-950/30">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {editingShuttle ? "Edit Shuttle Configuration" : "Add New Fleet Shuttle"}
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Shuttle ID</label>
              <input
                type="text"
                value={formData.shuttleId}
                disabled={Boolean(editingShuttle)}
                onChange={(e) => setFormData({ ...formData, shuttleId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Vehicle Number</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Passenger Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Assigned Route</label>
              <select
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">-- No Route Assigned --</option>
                {routes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.routeId} - {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="ON_TIME">ON_TIME</option>
                <option value="DELAYED">DELAYED</option>
                <option value="STOPPED">STOPPED</option>
                <option value="BREAKDOWN">BREAKDOWN</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Crowd Level</label>
              <select
                value={formData.crowdLevel}
                onChange={(e) => setFormData({ ...formData, crowdLevel: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700"
            >
              Save Shuttle
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex py-12 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Shuttle ID</th>
                <th className="px-4 py-3 font-semibold">Vehicle No</th>
                <th className="px-4 py-3 font-semibold">Route</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Crowd Level</th>
                <th className="px-4 py-3 font-semibold">Occupancy</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {shuttles.map((shuttle) => (
                <tr key={shuttle._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                    <Bus className="h-4 w-4" />
                    {shuttle.shuttleId}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {shuttle.vehicleNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {shuttle.route ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {shuttle.route.routeId} ({shuttle.route.name})
                      </span>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        shuttle.status === "ON_TIME"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : shuttle.status === "DELAYED"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {shuttle.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                    {shuttle.crowdLevel}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {shuttle.passengerCount} / {shuttle.capacity}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(shuttle)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(shuttle._id)}
                        className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
