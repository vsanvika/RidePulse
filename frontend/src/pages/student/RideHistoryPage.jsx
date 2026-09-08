import { useEffect, useState } from "react";
import { rideApi } from "../../services/rideService";
import { Clock, Bus, MapPin, Navigation, Calendar, Loader2 } from "lucide-react";

export default function RideHistoryPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await rideApi.getHistory();
        if (res.success && res.data?.rides) {
          setRides(res.data.rides);
        }
      } catch (err) {
        console.error("Failed to load ride history", err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Clock className="h-6 w-6 text-indigo-100" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              My Ride History
            </h1>
            <p className="text-xs text-indigo-100">
              Complete chronological record of all verified campus shuttle trips
            </p>
          </div>
        </div>
      </div>

      {/* Ride History Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Completed Trips ({rides.length})
          </h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-xs">Loading ride history...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No recorded rides found yet. Board a shuttle using a QR boarding pass to log rides automatically.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Shuttle</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Boarding Stop</th>
                  <th className="py-3 px-3">Destination</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rides.map((ride) => (
                  <tr key={ride._id} className="hover:bg-slate-50 dark:hover:bg-slate-950/60 transition">
                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {new Date(ride.boardedAt || ride.createdAt).toLocaleDateString()} at{" "}
                      {new Date(ride.boardedAt || ride.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      Shuttle {ride.shuttle?.shuttleId || "S01"}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {ride.route?.name || "Campus Express"}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                      {ride.boardingStop?.name || "Hostel Gate"}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                      {ride.destinationStop?.name || "Main Academic Block"}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {ride.status}
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
