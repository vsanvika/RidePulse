import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { driverApi, shuttlesApi } from "../../services/dataService";
import { passApi } from "../../services/passService";
import {
  Bus,
  ShieldCheck,
  QrCode,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function DriverDashboardPage() {
  const { user } = useAuthStore();
  const [shuttles, setShuttles] = useState([]);
  const [selectedShuttle, setSelectedShuttle] = useState(null);
  const [passengerCount, setPassengerCount] = useState(15);
  const [status, setStatus] = useState("ON_TIME");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [tripActive, setTripActive] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState("");

  const loadDriverShuttle = async () => {
    try {
      const res = await driverApi.getAssignedShuttle();
      if (res.success && res.data?.shuttle) {
        const myShuttle = res.data.shuttle;
        setShuttles([myShuttle]);
        setSelectedShuttle(myShuttle);
        setPassengerCount(myShuttle.passengerCount || 15);
        setStatus(myShuttle.status || "ON_TIME");
        setAssignmentMessage("");
      } else if (res.success) {
        setAssignmentMessage("No shuttle is assigned to this driver yet. Ask an admin to assign a vehicle.");
      }
    } catch (err) {
      console.error("Failed to load driver shuttle telemetry", err);
      setAssignmentMessage(err.response?.data?.message || "Unable to load your assigned shuttle.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverShuttle();
    driverApi.getTrip().then((res) => setTripActive(Boolean(res.data?.trip))).catch(() => {});
  }, []);

  const handleTrip = async () => {
    const res = tripActive ? await driverApi.endTrip() : await driverApi.startTrip();
    if (res.success) setTripActive(!tripActive);
    setMessage(res.message || "Trip status updated");
  };

  const handleIssue = async (type) => {
    const res = await driverApi.report({ type, description: `Driver reported ${type.toLowerCase()} from the live console.` });
    setMessage(res.message || "Report submitted");
  };

  const handleStopReached = async () => {
    const res = await driverApi.markStopReached();
    setMessage(res.message || "Stop updated");
    if (res.success && res.data?.shuttle) setSelectedShuttle(res.data.shuttle);
  };

  const handleUpdateTelemetry = async () => {
    if (!selectedShuttle) return;
    setUpdating(true);
    setMessage("");

    try {
      const res = await shuttlesApi.updateStatus(selectedShuttle._id, {
        passengerCount,
        status,
      });

      if (res.success) {
        setMessage("✅ Vehicle telemetry broadcasted live to campus map!");
        setTimeout(() => setMessage(""), 4000);
      }
    } catch (err) {
      setMessage("❌ Failed to update telemetry.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Radio className="h-3.5 w-3.5 animate-pulse text-amber-200" />
              <span>Live Shuttle Driver Console & Telemetry</span>
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome, Driver {user?.name}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-amber-100">
              Vehicle Operator ID: <span className="font-mono font-bold">DRV-2026</span> • Route Assignment Active
            </p>
          </div>

          <button onClick={loadDriverShuttle} title="Refresh assignment" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-white/25">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>

          <Link
            to="/driver/scanner"
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-amber-900 shadow transition hover:bg-amber-50"
          >
            <QrCode className="h-4 w-4" />
            <span>QR Pass Verification Scanner</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-600 mb-2" />
          <p className="text-xs font-bold">Connecting Driver Telemetry Controls...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Active Vehicle Telemetry Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            {assignmentMessage && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{assignmentMessage}</div>}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Active Vehicle Telemetry
                </h3>
              </div>

              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Shuttle {selectedShuttle?.shuttleId || "S01"}
              </span>
            </div>

            {/* Select Vehicle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Select Active Vehicle Unit
              </label>
              <div className="mt-1.5 flex min-h-11 items-center rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                {selectedShuttle ? `Shuttle ${selectedShuttle.shuttleId} (${selectedShuttle.vehicleNumber}) - Route ${selectedShuttle.route?.name || "Not assigned"}` : "No shuttle assigned"}
              </div>
              <p className="mt-1.5 text-[10px] text-slate-500">Vehicle assignments are managed by an administrator.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned route</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{selectedShuttle?.route?.name || "Not assigned"}</p></div>
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Trip status</p><p className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-300">{tripActive ? "Active" : "Not started"}</p></div>
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current stop</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{selectedShuttle?.currentStop?.name || "Awaiting GPS"}</p></div>
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Next stop</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{selectedShuttle?.nextStop?.name || "Awaiting GPS"}</p></div>
            </div>

            {/* Passenger Count Modifier */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-amber-600" /> Live Onboard Passenger Occupancy
              </span>
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setPassengerCount((prev) => Math.max(0, prev - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-300 font-extrabold text-lg shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {passengerCount} / {selectedShuttle?.capacity || 40}
                  </span>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    Occupancy: {Math.round((passengerCount / (selectedShuttle?.capacity || 40)) * 100)}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPassengerCount((prev) => Math.min(selectedShuttle?.capacity || 40, prev + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-300 font-extrabold text-lg shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Operational Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Vehicle Operational Status
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { id: "ON_TIME", label: "ON TIME", color: "border-emerald-500 text-emerald-600" },
                  { id: "DELAYED", label: "DELAYED", color: "border-amber-500 text-amber-600" },
                  { id: "BREAKDOWN", label: "BREAKDOWN", color: "border-rose-500 text-rose-600" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id)}
                    className={`rounded-xl border p-2.5 text-center text-xs font-extrabold transition ${
                      status === st.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {message && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center animate-fade-in">
                {message}
              </p>
            )}

            <button
              onClick={handleUpdateTelemetry}
              disabled={updating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-xs font-bold text-white shadow transition hover:bg-amber-700 disabled:opacity-50"
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : "BROADCAST TELEMETRY UPDATE"}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleTrip} className="rounded-xl border border-amber-300 px-3 py-2 text-xs font-bold text-amber-700">
                {tripActive ? "End Trip" : "Start Trip"}
              </button>
              <button onClick={() => handleIssue("DELAY")} className="rounded-xl border border-orange-300 px-3 py-2 text-xs font-bold text-orange-700">Report Delay</button>
              <button onClick={() => handleIssue("BREAKDOWN")} className="rounded-xl border border-rose-300 px-3 py-2 text-xs font-bold text-rose-700">Report Breakdown</button>
              <button onClick={() => handleIssue("EMERGENCY")} className="rounded-xl border border-red-300 px-3 py-2 text-xs font-bold text-red-700">Report Emergency</button>
              <button onClick={handleStopReached} className="rounded-xl border border-sky-300 px-3 py-2 text-xs font-bold text-sky-700">Mark Stop Reached</button>
            </div>
          </div>

          {/* Quick Actions & Pass Verification CTA */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-500 to-amber-700 p-6 text-white shadow-xl">
              <QrCode className="h-10 w-10 text-amber-200 mb-3" />
              <h3 className="text-lg font-black">Student QR Pass Scanner</h3>
              <p className="mt-1 text-xs text-amber-100">
                Scan or manually verify student boarding pass codes before boarding. Automatically logs ride entries.
              </p>
              <Link
                to="/driver/scanner"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-amber-900 shadow hover:bg-amber-50"
              >
                <span>OPEN QR SCANNER CONSOLE</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Shift Status Checklist
              </h4>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>GPS Telemetry Transmitter Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Route Stop Sequence Loaded</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Emergency Dispatch SOS Channel Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
