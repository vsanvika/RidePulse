import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-600 dark:text-slate-300">
        That route is not part of RidePulse yet, or the URL is incorrect.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800"
      >
        Back to home
      </Link>
    </div>
  );
}
