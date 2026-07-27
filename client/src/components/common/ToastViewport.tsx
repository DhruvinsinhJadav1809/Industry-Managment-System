import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { useContext } from "react";
import { ToastContext, type ToastVariant } from "../../context/ToastContext";

const config: Record<
  ToastVariant,
  { icon: typeof Info; classes: string }
> = {
  success: {
    icon: CheckCircle2,
    classes:
      "border-signal-400/40 bg-white text-steel-800 dark:border-signal-400/30 dark:bg-steel-900 dark:text-steel-100 [&_svg]:text-signal-500 dark:[&_svg]:text-signal-400",
  },
  error: {
    icon: AlertTriangle,
    classes:
      "border-red-300/70 bg-white text-steel-800 dark:border-red-500/30 dark:bg-steel-900 dark:text-steel-100 [&_svg]:text-red-500 dark:[&_svg]:text-red-400",
  },
  info: {
    icon: Info,
    classes:
      "border-steel-300/70 bg-white text-steel-800 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-100 [&_svg]:text-steel-500 dark:[&_svg]:text-steel-400",
  },
};

export function ToastViewport() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, dismissToast } = ctx;

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((toast) => {
        const { icon: Icon, classes } = config[toast.variant];
        return (
          <div
            key={toast.id}
            role={toast.variant === "error" ? "alert" : "status"}
            className={clsx(
              "toast-enter pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-md border px-4 py-3 text-sm shadow-lg shadow-steel-900/10 dark:shadow-black/30",
              classes
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="cursor-pointer rounded p-0.5 text-steel-400 transition-colors hover:bg-steel-100 hover:text-steel-700 dark:hover:bg-steel-800 dark:hover:text-steel-200"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
