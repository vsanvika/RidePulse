import { Inbox } from "lucide-react";

export default function EmptyState({ title = "No data found", description = "No items match your criteria." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-slate-100 p-4 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-3">
        <Inbox className="h-8 w-8" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h4>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
    </div>
  );
}
