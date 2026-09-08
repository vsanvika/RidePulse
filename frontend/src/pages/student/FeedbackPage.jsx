import { useEffect, useState } from "react";
import { MessageSquare, Send, Star } from "lucide-react";
import { feedbackApi } from "../../services/feedbackService";
import { shuttlesApi } from "../../services/dataService";

export default function FeedbackPage() {
  const [shuttles, setShuttles] = useState([]);
  const [form, setForm] = useState({ type: "FEEDBACK", rating: 5, shuttle: "", comment: "" });
  const [message, setMessage] = useState("");
  useEffect(() => { shuttlesApi.getAll().then((res) => setShuttles(res.data?.shuttles || [])).catch(() => {}); }, []);
  const submit = async (event) => {
    event.preventDefault();
    const res = await feedbackApi.create({ ...form, rating: form.type === "ISSUE" ? null : Number(form.rating) });
    setMessage(res.message || "Submitted");
    if (res.success) setForm({ ...form, comment: "" });
  };
  return <div className="mx-auto max-w-2xl space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Service quality</p><h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">Feedback and issue reports</h1></div>
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3"><MessageSquare className="h-5 w-5 text-indigo-600" /><h2 className="font-bold">Tell operations what happened</h2></div>
      <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="FEEDBACK">Rating and feedback</option><option value="ISSUE">Report shuttle issue</option></select>
      <select value={form.shuttle} onChange={(event) => setForm({ ...form, shuttle: event.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">Select shuttle (optional)</option>{shuttles.map((shuttle) => <option key={shuttle._id} value={shuttle._id}>{shuttle.shuttleId} - {shuttle.vehicleNumber}</option>)}</select>
      {form.type === "FEEDBACK" && <div className="flex items-center gap-2">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => setForm({ ...form, rating: value })}><Star className={`h-6 w-6 ${value <= form.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} /></button>)}</div>}
      <textarea required value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} rows={5} placeholder="Describe your experience or issue" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
      <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white"><Send className="h-4 w-4" /> Submit</button>{message && <span className="ml-2 text-xs font-semibold text-emerald-600">{message}</span>}
    </form>
  </div>;
}