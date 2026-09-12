import { useEffect, useState } from "react";
import { stopsApi } from "../../services/dataService";
import { Plus, Trash2, Edit2, MapPin, Loader2, RefreshCw } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function StopsPage() {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStop, setEditingStop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    stopId: "",
    name: "",
    code: "",
    latitude: 17.4130852,
    longitude: 78.6624997,
    facilities: "Shelter, Digital Board",
  });

  const setToast = useAuthStore((state) => state.setToast);

  const loadStops = async () => {
    setLoading(true);
    try {
      const res = await stopsApi.getAll();
      if (res.success) {
        setStops(res.data.stops);
      }
    } catch (_err) {
      setToast("Failed to load stops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStops();
  }, []);

  const handleOpenCreate = () => {
    setEditingStop(null);
    setFormData({
      stopId: `ST${String(stops.length + 1).padStart(2, "0")}`,
      name: "",
      code: "",
      latitude: 17.4130852,
      longitude: 78.6624997,
      facilities: "Shelter, Digital Board",
    });
    setShowForm(true);
  };

  const handleOpenEdit = (stop) => {
    setEditingStop(stop);
    setFormData({
      stopId: stop.stopId,
      name: stop.name,
      code: stop.code,
      latitude: stop.location?.latitude || 17.4130852,
      longitude: stop.location?.longitude || 78.6624997,
      facilities: Array.isArray(stop.facilities) ? stop.facilities.join(", ") : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stop?")) return;
    try {
      await stopsApi.delete(id);
      setToast("Stop deleted successfully");
      loadStops();
    } catch (_err) {
      setToast("Failed to delete stop");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      stopId: formData.stopId,
      name: formData.name,
      code: formData.code,
      location: {
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      },
      facilities: formData.facilities.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingStop) {
        await stopsApi.update(editingStop._id, payload);
        setToast("Stop updated successfully");
      } else {
        await stopsApi.create(payload);
        setToast("Stop created successfully");
      }
      setShowForm(false);
      loadStops();
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to save stop");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Campus Stops Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create, view, update, and manage shuttle boarding stops.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadStops}
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
            <span>Add New Stop</span>
          </button>
        </div>
      </div>

      {/* Form Modal / Collapsible */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-purple-200 bg-purple-50/50 p-6 shadow-md dark:border-purple-900/50 dark:bg-purple-950/30">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {editingStop ? "Edit Stop Details" : "Create New Campus Stop"}
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Stop ID
              </label>
              <input
                type="text"
                value={formData.stopId}
                disabled={Boolean(editingStop)}
                onChange={(e) => setFormData({ ...formData, stopId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Stop Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Science Block"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. STB"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Facilities (comma-separated)
              </label>
              <input
                type="text"
                value={formData.facilities}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
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
              Save Stop
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex py-12 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Facilities</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stops.map((stop) => (
                <tr key={stop._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-purple-600 dark:text-purple-400">
                    {stop.stopId}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {stop.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {stop.code}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {stop.location?.latitude?.toFixed(4)}, {stop.location?.longitude?.toFixed(4)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {stop.facilities?.map((f) => (
                        <span key={f} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(stop)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(stop._id)}
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
