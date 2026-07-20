import { useField } from "formik";
import { AlertCircle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  icon?: ReactNode;
  hint?: string;
  rightSlot?: ReactNode;
}

export function TextField({
  name,
  label,
  icon,
  hint,
  rightSlot,
  className,
  id,
  type = "text",
  ...rest
}: TextFieldProps) {
  const [field, meta] = useField(name);
  const inputId = id ?? `field-${name}`;
  const hasError = Boolean(meta.touched && meta.error);
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel-400 dark:text-steel-500">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          {...field}
          {...rest}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : hint ? hintId : undefined}
          className={clsx(
            "w-full rounded-md border bg-white/70 py-2.5 text-sm text-steel-900 outline-none",
            "placeholder:text-steel-400 dark:bg-steel-900/40 dark:text-steel-50 dark:placeholder:text-steel-500",
            "transition-colors duration-150",
            icon ? "pl-10" : "pl-3.5",
            rightSlot ? "pr-10" : "pr-3.5",
            hasError
              ? "border-red-400 focus:border-red-500 dark:border-red-500/70"
              : "border-steel-200 focus:border-steel-500 dark:border-steel-700 dark:focus:border-amber-400/70",
            className
          )}
        />

        {rightSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </div>

      {hasError ? (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {meta.error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-steel-500 dark:text-steel-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
