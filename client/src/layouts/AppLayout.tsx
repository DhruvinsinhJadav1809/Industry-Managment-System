import { LayoutDashboard, LogOut, Users as UsersIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { Logo, ThemeToggle } from "../components/common";
import { useAuth } from "../context/AuthContext";
import { ROLES, ROLE_LABELS } from "../constants/roles";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, show: true },
    {
      to: "/users",
      label: "Users",
      icon: UsersIcon,
      show: user?.roleId === ROLES.ADMIN,
    },
  ];

  return (
    <div className="min-h-screen bg-steel-50 dark:bg-steel-950">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-steel-200 bg-steel-50/90 px-6 py-3.5 backdrop-blur-sm dark:border-steel-800 dark:bg-steel-950/90">
        <div className="flex items-center gap-8">
          <Logo size={30} />
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems
              .filter((item) => item.show)
              .map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-body text-sm font-medium transition-colors",
                    location.pathname === to
                      ? "bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950"
                      : "text-steel-600 hover:bg-steel-100 dark:text-steel-300 dark:hover:bg-steel-800/60"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden text-right sm:block">
              <p className="font-body text-sm font-semibold text-steel-800 dark:text-steel-100">
                {user.fullName}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wide text-steel-400 dark:text-steel-500">
                {ROLE_LABELS[user.roleId ?? -1] ?? "Member"}
              </p>
            </div>
          )}
          <ThemeToggle />
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            className="rounded-md p-2 text-steel-500 transition-colors hover:bg-steel-100 hover:text-steel-800 dark:text-steel-400 dark:hover:bg-steel-800/60 dark:hover:text-steel-100"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
