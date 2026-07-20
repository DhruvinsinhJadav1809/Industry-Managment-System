import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
      className="group relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-steel-300/70 bg-steel-100 px-1 transition-colors duration-200 dark:border-steel-700 dark:bg-steel-900"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm shadow-steel-900/10 transition-transform duration-200 ease-out dark:bg-steel-700"
        style={{
          transform: isDark ? "translateX(28px)" : "translateX(0px)",
        }}
      >
        {isDark ? (
          <Moon className="size-3.5 text-amber-300" aria-hidden="true" />
        ) : (
          <Sun className="size-3.5 text-steel-700" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
