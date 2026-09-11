import type { ReactNode } from "react";
import { Activity, Factory, Gauge, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const stats = [
  { icon: Factory, label: "Facilities online", value: "128" },
  { icon: Activity, label: "Avg. uptime", value: "99.4%" },
  { icon: ShieldCheck, label: "Safety incidents", value: "0" },
];

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-steel-50 font-body dark:bg-steel-950">
      {/* Left: brand / signature panel */}
      <aside className="blueprint-grid relative hidden w-[46%] flex-col justify-between overflow-hidden bg-steel-900 px-12 py-10 lg:flex">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(240,169,58,0.5) 0%, transparent 70%)",
          }}
        />

        <Logo size={40} />

        <div className="relative z-10 max-w-md">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber-400">
            {eyebrow}
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.15] text-steel-50">
            {title}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-steel-300">
            {subtitle}
          </p>
        </div>

        <p className="relative z-10 font-mono text-[11px] text-steel-500">
          IMS © {new Date().getFullYear()} — Plant &amp; workforce control
        </p>
      </aside>

      {/* Right: form panel */}
      <main className="flex flex-1 flex-col">
        <div className="flex items-center px-6 py-6 sm:px-10 lg:hidden">
          <Logo size={32} />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
          <div className="corner-frame w-full max-w-sm rounded-lg border border-steel-200 bg-white/80 p-8 shadow-xl shadow-steel-900/5 backdrop-blur-sm dark:border-steel-800 dark:bg-steel-900/60 dark:shadow-black/20">
            <h2 className="font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-steel-500 dark:text-steel-400">
              {subtitle}
            </p>

            <div className="mt-7">{children}</div>

            <div className="mt-6 border-t border-steel-100 pt-5 text-center text-sm dark:border-steel-800">
              {footer}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
