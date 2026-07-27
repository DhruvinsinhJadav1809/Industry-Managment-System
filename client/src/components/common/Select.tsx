import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { clsx } from "clsx";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  placeholder?: string;
}

export function Select({
  label,
  options,
  placeholder,
  id,
  className,
  ...rest
}: SelectProps) {
  const selectId = id ?? `select-${label ?? "field"}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          {...rest}
          className={clsx(
            "w-full appearance-none rounded-md border border-steel-200 bg-white py-2.5 pl-3.5 pr-9 text-sm text-steel-900 outline-none",
            "transition-colors duration-150 hover:border-steel-300 focus:border-steel-500",
            "dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:hover:border-steel-600 dark:focus:border-amber-400/70",
            className
          )}
        >
          {placeholder && (
            <option value="" className="bg-white text-steel-900 dark:bg-steel-900 dark:text-steel-50">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-white text-steel-900 dark:bg-steel-900 dark:text-steel-50"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-steel-400 dark:text-steel-500"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
