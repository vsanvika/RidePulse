import { useEffect, useState } from "react";
import { passApi } from "../../services/passService";
import { routesApi } from "../../services/dataService";
import { useAuthStore } from "../../store/authStore";
import { QrCode, Ticket, Calendar, ShieldCheck, Bus, Loader2, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function QRBoardingPassPage() {
  const { user } = useAuthStore();
  const [routes, setRoutes] = useState([]);
  const [passes, setPasses] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [currentPass, setCurrentPass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInitial() {
      try {
        const [resRoutes, resPasses] = await Promise.all([
          routesApi.getAll(),
          passApi.getMyPasses(),
        ]);

        if (resRoutes.success && resRoutes.data?.routes) {
          setRoutes(resRoutes.data.routes);
          if (resRoutes.data.routes[0]) setSelectedRouteId(resRoutes.data.routes[0]._id);
        }

        if (resPasses.success && resPasses.data?.passes) {
          setPasses(resPasses.data.passes);
          if (resPasses.data.passes.length > 0) {
            setCurrentPass(resPasses.data.passes[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load boarding pass data", err);
      }
    }

    loadInitial();
  }, []);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!selectedRouteId) return;

    setLoading(true);
    setError("");

    try {
      const res = await passApi.generatePass(selectedRouteId);
      if (res.success && res.data?.pass) {
        setCurrentPass(res.data.pass);
        setPasses((prev) => [res.data.pass, ...prev]);
      } else {
        setError(res.message || "Failed to generate boarding pass.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate pass.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Ticket className="h-6 w-6 text-indigo-100" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Digital QR Boarding Pass
            </h1>
            <p className="text-xs text-indigo-100">
              Generate digital boarding passes for quick campus shuttle boarding verification
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pass Generator Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Generate New Boarding Pass
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Select route to generate valid digital QR code for today
          </p>

          <form onSubmit={handleGenerate} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Select Route *
              </label>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {routes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.routeId} - {r.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Generate Digital Pass</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Past Passes List */}
          <div className="mt-8 border-t border-slate-100 pt-5 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Recent Boarding Passes ({passes.length})
            </h4>
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
              {passes.map((p) => (
                <div
                  key={p._id}
                  onClick={() => setCurrentPass(p)}
                  className={`cursor-pointer rounded-xl border p-3 text-xs transition ${
                    currentPass?._id === p._id
                      ? "border-indigo-600 bg-indigo-50/80 dark:border-indigo-500 dark:bg-indigo-950/60"
                      : "border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>{p.route?.name || "Route"}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] ${
                        p.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    ID: {p.passCode} • {new Date(p.validDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Digital Boarding Ticket Card Display */}
        {currentPass ? (
          <div className="rounded-3xl border-2 border-indigo-600 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-2xl relative overflow-hidden">
            {/* Top Ticket Header */}
            <div className="flex items-center justify-between border-b border-indigo-800/60 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-indigo-400" />
                <div>
                  <h3 className="text-base font-extrabold tracking-wide text-white">
                    RIDE-PULSE
                  </h3>
                  <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold">
                    Campus Boarding Pass
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-extrabold shadow ${
                  currentPass.status === "ACTIVE"
                    ? "bg-emerald-500 text-white animate-pulse"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {currentPass.status}
              </span>
            </div>

            {/* QR Code Section */}
            <div className="my-6 flex flex-col items-center justify-center space-y-3">
              <div className="rounded-xl bg-white p-2">
                <QRCodeSVG value={currentPass.passCode} size={136} includeMargin />
              </div>
              <div className="text-center">
                <span className="font-mono text-sm font-extrabold tracking-wider text-amber-300">
                  {currentPass.passCode}
                </span>
                <p className="text-[10px] text-indigo-300 mt-0.5">
                  Present this QR code to driver upon boarding
                </p>
              </div>
            </div>

            {/* Ticket Info Details Grid */}
            <div className="rounded-2xl border border-indigo-800/80 bg-black/40 p-4 space-y-3 backdrop-blur">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400">Student Name</span>
                  <p className="font-extrabold text-white">{user?.name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400">Student ID</span>
                  <p className="font-extrabold text-white">{user?.studentId || "STU-2026"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-indigo-900/60 pt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400">Assigned Route</span>
                  <p className="font-extrabold text-indigo-300">{currentPass.route?.name || "Campus Express"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400">Valid Date</span>
                  <p className="font-extrabold text-white">{new Date(currentPass.validDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <QrCode className="h-12 w-12 text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-500">
              No active pass generated yet. Select a route and click "Generate Digital Pass".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
