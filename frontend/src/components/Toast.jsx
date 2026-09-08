import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Toast() {
  const toastMessage = useAuthStore((state) => state.toastMessage);
  const error = useAuthStore((state) => state.error);
  const clearToast = useAuthStore((state) => state.clearToast);
  const clearError = useAuthStore((state) => state.clearError);

  const message = toastMessage || error;
  const isError = Boolean(!toastMessage && error);

  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        {isError ? (
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
        ) : (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
        )}
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {message}
        </p>
        <button
          type="button"
          onClick={() => {
            clearToast();
            clearError();
          }}
          className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
