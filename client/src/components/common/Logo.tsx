import { clsx } from "clsx";

interface LogoProps {
  withWordmark?: boolean;
  className?: string;
  size?: number;
}

export function Logo({ withWordmark = true, className, size = 36 }: LogoProps) {
  return (
    <div className={clsx("flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M32 2 L59 17.5 V46.5 L32 62 L5 46.5 V17.5 Z"
          className="fill-steel-800 dark:fill-steel-800"
        />
        <path
          d="M32 2 L59 17.5 V46.5 L32 62 L5 46.5 V17.5 Z"
          fill="none"
          className="stroke-steel-400"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <g
          className="stroke-steel-300"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.85"
        >
          <line x1="32" y1="14" x2="32" y2="18" />
          <line x1="45" y1="20" x2="42.2" y2="22.4" />
          <line x1="19" y1="20" x2="21.8" y2="22.4" />
          <line x1="49" y1="32" x2="45" y2="32" />
          <line x1="15" y1="32" x2="19" y2="32" />
        </g>
        <circle
          cx="32"
          cy="34"
          r="14"
          fill="none"
          className="stroke-steel-500"
          strokeWidth="2"
          opacity="0.6"
        />
        <line
          x1="32"
          y1="34"
          x2="40"
          y2="26"
          className="stroke-amber-400"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="32" cy="34" r="3.4" className="fill-amber-400" />
      </svg>

      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-steel-900 dark:text-steel-50">
            IMS
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
            Industry Mgmt.
          </span>
        </div>
      )}
    </div>
  );
}
