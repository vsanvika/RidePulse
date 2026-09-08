import { useEffect, useState } from "react";
import { routesApi, stopsApi } from "../../services/dataService";
import { Plus, Trash2, Edit2, Loader2, RefreshCw } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoute, setEditingRoute] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    routeId: "",
    name: "",
    code: "",
    color: "#2563EB",
    estimatedDuration: 20,
    selectedStops: [],
  });

  const setToast = useAuthStore((state) => state.setToast);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRoutes, resStops] = await Promise.all([
        routesApi.getAll(),
        stopsApi.getAll(),
      ]);
      if (resRoutes.success) setRoutes(resRoutes.data.routes);
      if (resStops.success) setStops(resStops.data.stops);
    } catch (_err) {
      setToast("Failed to load routes data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingRoute(null);
    setFormData({
      routeId: `R0${routes.length + 1}`,
      name: "",
      code: "",
      color: "#2563EB",
      estimatedDuration: 20,
      selectedStops: [],
    });
    setShowForm(true);
  };

  const handleOpenEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      routeId: route.routeId,
      name: route.name,
      code: route.code,
      color: route.color || "#2563EB",
      estimatedDuration: route.estimatedDuration || 20,
      selectedStops: route.stops ? route.stops.map((s) => s._id || s) : [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      await routesApi.delete(id);
      setToast("Route deleted successfully");
      loadData();
    } catch (_err) {
      setToast("Failed to delete route");
    }
  };

  const toggleStopSelection = (stopId) => {
    setFormData((prev) => {
      const exists = prev.selectedStops.includes(stopId);
      if (exists) {
        return { ...prev, selectedStops: prev.selectedStops.filter((id) => id !== stopId) };
      } else {
        return { ...prev, selectedStops: [...prev.selectedStops, stopId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      routeId: formData.routeId,
      name: formData.name,
      code: formData.code,
      color: formData.color,
      estimatedDuration: Number(formData.estimatedDuration),
      stops: formData.selectedStops,
    };

    try {
      if (editingRoute) {
        await routesApi.update(editingRoute._id, payload);
        setToast("Route updated successfully");
      } else {
        await routesApi.create(payload);
        setToast("Route created successfully");
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to save route");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Shuttle Routes Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create and configure campus shuttle routes and their ordered stop sequences.
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
            <span>Add New Route</span>
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-purple-200 bg-purple-50/50 p-6 shadow-md dark:border-purple-900/50 dark:bg-purple-950/30">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {editingRoute ? "Edit Route Details" : "Create New Campus Route"}
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Route ID</label>
              <input
                type="text"
                value={formData.routeId}
                disabled={Boolean(editingRoute)}
                onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Route Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Express Loop"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="EXP-01"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Color Hex</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded border border-slate-300"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Duration (mins)</label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Select Stops in Sequence</label>
            <div className="mt-2 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              {stops.map((stop) => {
                const isSelected = formData.selectedStops.includes(stop._id);
                return (
                  <button
                    key={stop._id}
                    type="button"
                    onClick={() => toggleStopSelection(stop._id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition ${
                      isSelected
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
                    }`}
                  >
                    {isSelected ? `✓ ${stop.name}` : `+ ${stop.name}`}
                  </button>
                );
              })}
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
              Save Route
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex py-12 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <div key={route._id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: route.color || "#2563EB" }} />
                    {route.name}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {route.routeId}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Code: {route.code} | ~{route.estimatedDuration} mins</p>

                <div className="mt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sequence ({route.stops?.length || 0} stops)</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {route.stops?.map((stop, idx) => (
                      <span key={stop._id || idx} className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {stop.name || stop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  onClick={() => handleOpenEdit(route)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(route._id)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
