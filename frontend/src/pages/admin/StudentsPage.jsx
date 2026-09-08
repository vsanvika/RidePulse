import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminService";
import { Users, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await adminApi.getUsers("STUDENT");
      if (res.success && res.data?.users) {
        setStudents(res.data.users);
      }
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      await adminApi.updateUser(user._id, { isActive: !user.isActive });
      fetchStudents();
    } catch (err) {
      console.error("Failed to update student status", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Registered Students Directory
          </h1>
          <p className="text-xs text-slate-500">
            View and manage student accounts registered on RidePulse
          </p>
        </div>
        <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {students.length} Total Students
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-xs font-bold">Loading student directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Student ID</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-950/60 transition">
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                      {student.name}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {student.studentId || "STU-2026"}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                      {student.email}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                      {student.department || "Computer Science"}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(student)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold transition ${
                          student.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {student.isActive ? "ACTIVE" : "SUSPENDED"}
                      </button>
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
