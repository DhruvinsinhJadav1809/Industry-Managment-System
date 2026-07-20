import { useField } from "formik";
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

interface PasswordFieldProps {
  name: string;
  label: string;
  id?: string;
  autoComplete?: string;
  placeholder?: string;
  showStrength?: boolean;
}

interface Rule {
  label: string;
  test: (value: string) => boolean;
}

const rules: Rule[] = [
  { label: "8+ characters", test: (v) => v.length >= 8 },
  { label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "Special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function PasswordField({
  name,
  label,
  id,
  autoComplete = "new-password",
  placeholder,
  showStrength = false,
}: PasswordFieldProps) {
  const [field, meta] = useField(name);
  const [visible, setVisible] = useState(false);
  const inputId = id ?? `field-${name}`;
  const hasError = Boolean(meta.touched && meta.error);
  const errorId = `${inputId}-error`;

  const passedCount = rules.filter((r) => r.test(field.value ?? "")).length;
  const isDirty = (field.value ?? "").length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
      >
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel-400 dark:text-steel-500">
          <Lock className="size-4" aria-hidden="true" />
        </span>

        <input
          id={inputId}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          {...field}
          value={field.value ?? ""}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={clsx(
            "w-full rounded-md border bg-white/70 py-2.5 pl-10 pr-10 text-sm text-steel-900 outline-none",
            "placeholder:text-steel-400 dark:bg-steel-900/40 dark:text-steel-50 dark:placeholder:text-steel-500",
            "transition-colors duration-150",
            hasError
              ? "border-red-400 focus:border-red-500 dark:border-red-500/70"
              : "border-steel-200 focus:border-steel-500 dark:border-steel-700 dark:focus:border-amber-400/70"
          )}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 transition-colors hover:text-steel-700 dark:text-steel-500 dark:hover:text-steel-200"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {showStrength && isDirty && (
        <div className="flex flex-col gap-1.5 pt-0.5">
          <div className="flex gap-1">
            {rules.map((rule, i) => (
              <span
                key={rule.label}
                className={clsx(
                  "h-1 flex-1 rounded-full transition-colors duration-200",
                  i < passedCount
                    ? passedCount === rules.length
                      ? "bg-signal-500 dark:bg-signal-400"
                      : "bg-amber-400"
                    : "bg-steel-200 dark:bg-steel-700"
                )}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {rules.map((rule) => {
              const passed = rule.test(field.value ?? "");
              return (
                <span
                  key={rule.label}
                  className={clsx(
                    "font-mono text-[11px]",
                    passed
                      ? "text-signal-500 dark:text-signal-400"
                      : "text-steel-400 dark:text-steel-500"
                  )}
                >
                  {passed ? "✓" : "·"} {rule.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {hasError && (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {meta.error}
        </p>
      )}
    </div>
  );
}
