import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-steel-800 text-steel-50 hover:bg-steel-900 active:bg-steel-950 " +
    "dark:bg-amber-400 dark:text-steel-950 dark:hover:bg-amber-300 dark:active:bg-amber-500 " +
    "shadow-sm shadow-steel-900/10",
  secondary:
    "bg-transparent text-steel-800 border border-steel-300 hover:bg-steel-100 " +
    "dark:text-steel-100 dark:border-steel-700 dark:hover:bg-steel-800/60",
  ghost:
    "bg-transparent text-steel-600 hover:text-steel-900 hover:bg-steel-100 " +
    "dark:text-steel-300 dark:hover:text-steel-50 dark:hover:bg-steel-800/60",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-900/10",
};

export function Button({
  variant = "primary",
  isLoading = false,
  icon,
  fullWidth = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5",
        "font-body text-sm font-semibold tracking-wide",
        "transition-colors duration-150 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth && "w-full",
        variantClasses[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
