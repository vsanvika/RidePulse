import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Bus, QrCode } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import ThemeToggle from "../components/ThemeToggle";

export default function DriverLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/driver/dashboard", label: "Telemetry Console", icon: Bus },
    { to: "/driver/scanner", label: "QR Pass Scanner", icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-amber-200/80 bg-white/80 backdrop-blur dark:border-amber-900/50 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/driver/dashboard" className="text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              RidePulse
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
              <Bus className="h-3 w-3" /> Driver Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
              <span className="text-slate-500 dark:text-slate-400">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar for Driver Modules */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-1.5 dark:border-slate-800/80 dark:bg-slate-950/50 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-amber-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </div>
    </div>
  );
}
