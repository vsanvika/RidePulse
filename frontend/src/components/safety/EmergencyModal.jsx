import { useState } from "react";
import { emergencyApi } from "../../services/emergencyService";
import { ShieldAlert, AlertTriangle, X, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function EmergencyModal({ shuttles = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("Medical Emergency");
  const [description, setDescription] = useState("");
  const [shuttleId, setShuttleId] = useState("");
  const [landmark, setLandmark] = useState("Main Campus SAC");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Medical Emergency",
    "Accident",
    "Unsafe Situation",
    "Vehicle Problem",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe the emergency situation.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await emergencyApi.submitReport({
        category,
        description,
        shuttleId: shuttleId || "N/A",
        location: { latitude: 17.4145852, longitude: 78.6654997, landmark },
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setIsOpen(false);
          setDescription("");
        }, 2000);
      } else {
        setError(res.message || "Failed to submit emergency report.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting emergency report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating SOS Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-rose-600 px-4 py-3 font-extrabold text-white shadow-2xl transition hover:bg-rose-700 hover:scale-105 active:scale-95 border-2 border-rose-400 animate-pulse"
      >
        <ShieldAlert className="h-5 w-5" />
        <span className="text-xs uppercase tracking-wider">Report Emergency SOS</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-6 w-6 animate-bounce" />
                <h3 className="text-base font-extrabold tracking-tight">
                  Campus Emergency Assistance
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="my-8 text-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Emergency Alert Transmitted!
                </h4>
                <p className="text-xs text-slate-500">
                  Campus Security & Operations Admin have been notified in real time.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Emergency Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Situation Details & Description *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe exact incident (e.g. Student injured near Hostel Gate, Shuttle breakdown)..."
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                {/* Shuttle Selection (Optional) */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Related Shuttle (Optional)
                    </label>
                    <select
                      value={shuttleId}
                      onChange={(e) => setShuttleId(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="">None / Not On Shuttle</option>
                      {shuttles.map((s) => (
                        <option key={s._id} value={s.shuttleId}>
                          Shuttle {s.shuttleId} ({s.vehicleNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Landmark / Stop
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-xs font-extrabold text-white shadow-lg transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Transmitting High-Priority SOS...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>TRANSMIT EMERGENCY REPORT</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
