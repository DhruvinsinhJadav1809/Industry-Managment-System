import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface DashboardSectionProps {
  title: string;
  description: string;
  trailing?: ReactNode;
  children: ReactNode;
}

export function DashboardSection({
  title,
  description,
  trailing,
  children,
}: DashboardSectionProps) {
  return (
    <details className="corner-frame group rounded-lg border border-steel-200 bg-white/70 p-5 dark:border-steel-800 dark:bg-steel-900/40 sm:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-500 [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="font-display text-base font-bold text-steel-900 dark:text-steel-50">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-steel-500 dark:text-steel-400">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {trailing}
          <ChevronDown
            className="size-4 text-steel-500 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </div>
      </summary>
      <div className="mt-5">{children}</div>
    </details>
  );
}
