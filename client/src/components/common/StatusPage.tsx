import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./Button";

interface StatusPageProps {
  code: string;
  icon: LucideIcon;
  title: string;
  message: string;
  primaryAction: { label: string; to?: string; onClick?: () => void };
  secondaryAction?: { label: string; to: string };
}

export function StatusPage({
  code,
  icon: Icon,
  title,
  message,
  primaryAction,
  secondaryAction,
}: StatusPageProps) {
  return (
    <div className="blueprint-grid flex min-h-screen flex-col items-center justify-center bg-steel-50 px-6 text-center dark:bg-steel-950">
      <Logo size={36} className="mb-10" />

      <div className="corner-frame relative rounded-lg border border-steel-200 bg-white/80 px-10 py-12 shadow-xl shadow-steel-900/5 backdrop-blur-sm dark:border-steel-800 dark:bg-steel-900/60 dark:shadow-black/20">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-steel-100 dark:bg-steel-800/70">
          <Icon className="size-7 text-amber-500 dark:text-amber-400" aria-hidden="true" />
        </div>

        <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-steel-400 dark:text-steel-500">
          Error {code}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-steel-500 dark:text-steel-400">
          {message}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {primaryAction.to ? (
            <Link to={primaryAction.to} className="w-full sm:w-auto">
              <Button fullWidth>{primaryAction.label}</Button>
            </Link>
          ) : (
            <Button onClick={primaryAction.onClick} fullWidth className="sm:w-auto">
              {primaryAction.label}
            </Button>
          )}

          {secondaryAction && (
            <Link to={secondaryAction.to} className="w-full sm:w-auto">
              <Button variant="secondary" fullWidth>
                {secondaryAction.label}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
