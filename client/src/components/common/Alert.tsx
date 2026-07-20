import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";
import { clsx } from "clsx";

type AlertVariant = "error" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
}

const config: Record<
  AlertVariant,
  { icon: typeof Info; classes: string }
> = {
  error: {
    icon: AlertTriangle,
    classes:
      "border-red-300/70 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  },
  success: {
    icon: CheckCircle2,
    classes:
      "border-signal-400/40 bg-signal-500/10 text-signal-500 dark:border-signal-400/30 dark:bg-signal-400/10 dark:text-signal-400",
  },
  info: {
    icon: Info,
    classes:
      "border-steel-300/70 bg-steel-100 text-steel-700 dark:border-steel-700 dark:bg-steel-800/60 dark:text-steel-300",
  },
};

export function Alert({ variant = "info", children }: AlertProps) {
  const { icon: Icon, classes } = config[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={clsx(
        "flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm",
        classes
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span className="leading-snug">{children}</span>
    </div>
  );
}
