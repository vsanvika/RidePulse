import { Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-lg font-semibold tracking-tight text-indigo-700 dark:text-indigo-300">
            RidePulse
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
