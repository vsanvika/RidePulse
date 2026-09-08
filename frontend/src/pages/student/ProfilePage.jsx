import { useEffect, useState } from "react";
import { Save, Heart, UserRound } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { toggleFavoriteApi } from "../../services/authService";
import { routesApi, stopsApi } from "../../services/dataService";

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [form, setForm] = useState({ name: "", phone: "", department: "" });
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm({ name: user?.name || "", phone: user?.phone || "", department: user?.department || "" });
    Promise.all([routesApi.getAll(), stopsApi.getAll()]).then(([routeRes, stopRes]) => {
      setRoutes(routeRes.data?.routes || []);
      setStops(stopRes.data?.stops || []);
    }).catch(() => {});
  }, [user]);

  const save = async (event) => {
    event.preventDefault();
    const result = await updateProfile(form);
    setMessage(result.success ? "Profile saved" : result.error);
  };

  const favorite = async (type, id) => {
    const result = await toggleFavoriteApi(type, id);
    if (result.success) setMessage(result.active ? "Added to favorites" : "Removed from favorites");
  };

  const isFavorite = (type, id) => (type === "route" ? user?.favoriteRoutes : user?.favoriteStops)?.some((value) => String(value?._id || value) === String(id));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Account</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">Profile and favorites</h1>
      </div>
      <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-3"><UserRound className="h-5 w-5 text-indigo-600" /><h2 className="font-bold">Profile details</h2></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[["name", "Name"], ["phone", "Phone"], ["department", "Department"]].map(([key, label]) => (
            <label key={key} className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}
              <input value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </label>
          ))}
        </div>
        <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white"><Save className="h-4 w-4" /> Save profile</button>
        {message && <span className="ml-3 text-xs font-semibold text-emerald-600">{message}</span>}
      </form>
      <div className="grid gap-6 md:grid-cols-2">
        <FavoriteList title="Favorite routes" items={routes} type="route" isFavorite={isFavorite} onToggle={favorite} />
        <FavoriteList title="Favorite stops" items={stops} type="stop" isFavorite={isFavorite} onToggle={favorite} />
      </div>
    </div>
  );
}

function FavoriteList({ title, items, type, isFavorite, onToggle }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <h2 className="mb-3 font-bold">{title}</h2>
    <div className="space-y-2">{items.map((item) => <button key={item._id} onClick={() => onToggle(type, item._id)} className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-left text-xs hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"><span>{item.name || item.routeId}</span><Heart className={`h-4 w-4 ${isFavorite(type, item._id) ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} /></button>)}</div>
  </section>;
}