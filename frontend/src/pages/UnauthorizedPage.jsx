import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function UnauthorizedPage() {
  const { user } = useAuthStore();

  const getHomeLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin/dashboard";
    if (user.role === "DRIVER") return "/driver/dashboard";
    return "/student/dashboard";
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
      <div className="rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-950/80 dark:text-red-400">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        403 - Access Denied
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
        You do not have the required role permissions to view this portal page.
      </p>
      {user && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Logged in as: <span className="font-semibold">{user.email}</span> ({user.role})
        </p>
      )}

      <Link
        to={getHomeLink()}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Authorized Dashboard</span>
      </Link>
    </div>
  );
}
