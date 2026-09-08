export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex justify-between items-center">
        <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-4 h-8 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-2 h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-8 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-900" />
      <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-900" />
      <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-900" />
    </div>
  );
}
