import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Truck,
  Users as UsersIcon,
  X,
  Wallet,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { useAuth } from "../context/AuthContext";
import { ROLES, ROLE_LABELS } from "../constants/roles";
import { CompanyBrand, ThemeToggle } from "../components/common";
import { NotificationBell } from "../components/common";

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: null as number[] | null,
  },
  { to: "/users", label: "Users", icon: UsersIcon, roles: [ROLES.ADMIN] },
  {
    to: "/departments",
    label: "Departments",
    icon: Building2,
    roles: [ROLES.ADMIN],
  },
  {
    to: "/products",
    label: "Products",
    icon: Package,
    roles: [ROLES.ADMIN],
  },
  {
    to: "/suppliers",
    label: "Suppliers",
    icon: Truck,
    roles: [ROLES.ADMIN],
  },
  {
    to: "/purchases",
    label: "Purchase",
    icon: Wallet,
    roles: [ROLES.ADMIN],
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
    roles: [ROLES.ADMIN],
  },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const location = useLocation();

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.roleId ?? -1),
  );

  return (
    <>
      <div className="px-5 py-5">
        <CompanyBrand size={30} />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        <p className="px-2.5 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-steel-500 dark:text-steel-500">
          Menu
        </p>
        {visibleItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={clsx(
                "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 font-body text-sm font-medium transition-colors",
                active
                  ? "bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950"
                  : "text-steel-600 hover:bg-steel-100 hover:text-steel-900 dark:text-steel-300 dark:hover:bg-steel-800/60 dark:hover:text-steel-50",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <p className="px-5 pb-5 font-mono text-[10px] text-steel-500">
        IMS © {new Date().getFullYear()}
      </p>
    </>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-steel-50 dark:bg-steel-950">
      {/* Desktop sidebar */}
      <aside className="blueprint-grid hidden h-screen w-60 shrink-0 flex-col border-r border-steel-200 bg-white sticky top-0 md:flex dark:border-steel-800 dark:bg-steel-900">
        {" "}
        <SidebarNav />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 cursor-pointer bg-steel-950/60 backdrop-blur-sm"
          />
          <aside className="blueprint-grid relative flex h-full w-64 flex-col border-r border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-900">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 cursor-pointer rounded-md p-1.5 text-steel-400 hover:bg-steel-100 hover:text-steel-800 dark:hover:bg-steel-800 dark:hover:text-steel-100"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-steel-200 bg-steel-50/90 px-4 py-3.5 backdrop-blur-sm dark:border-steel-800 dark:bg-steel-950/90 sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="cursor-pointer rounded-md p-2 text-steel-500 hover:bg-steel-100 hover:text-steel-800 dark:text-steel-400 dark:hover:bg-steel-800/60 dark:hover:text-steel-100 md:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          <div className="hidden md:block" />

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
            {user?.roleId === ROLES.STAFF && <NotificationBell />}
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="cursor-pointer rounded-md p-2 text-steel-500 transition-colors hover:bg-steel-100 hover:text-steel-800 dark:text-steel-400 dark:hover:bg-steel-800/60 dark:hover:text-steel-100"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
