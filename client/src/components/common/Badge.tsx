import type { ReactNode } from "react";
import { clsx } from "clsx";

type BadgeTone = "neutral" | "amber" | "signal" | "red";

const toneClasses: Record<BadgeTone, string> = {
  neutral:
    "bg-steel-100 text-steel-700 dark:bg-steel-800/70 dark:text-steel-300",
  amber:
    "bg-amber-400/15 text-amber-600 dark:text-amber-400",
  signal:
    "bg-signal-500/10 text-signal-500 dark:bg-signal-400/10 dark:text-signal-400",
  red: "bg-red-500/10 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}
