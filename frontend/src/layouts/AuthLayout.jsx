import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <Link to="/" className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
          RidePulse
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-600">
        RidePulse Campus Shuttle Intelligence Platform
      </footer>
    </div>
  );
}
