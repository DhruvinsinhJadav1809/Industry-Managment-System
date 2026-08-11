import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { useNotifications } from "../../context/NotificationContext";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative cursor-pointer rounded-md p-2 text-steel-500 transition-colors hover:bg-steel-100 hover:text-steel-800 dark:text-steel-400 dark:hover:bg-steel-800/60 dark:hover:text-steel-100"
      >
        <Bell className="size-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-amber-500 font-mono text-[9px] font-bold text-steel-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-md border border-steel-200 bg-white shadow-lg dark:border-steel-700 dark:bg-steel-900">
          <div className="flex items-center justify-between border-b border-steel-100 px-4 py-3 dark:border-steel-800">
            <p className="font-body text-sm font-semibold text-steel-900 dark:text-steel-50">
              Notifications
            </p>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="cursor-pointer text-xs font-medium text-steel-500 hover:text-steel-800 dark:text-steel-400 dark:hover:text-amber-400"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-steel-400 dark:text-steel-500">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => {
                const body = (
                  <div
                    className={clsx(
                      "border-b border-steel-100 px-4 py-3 last:border-0 dark:border-steel-800/60",
                      !n.read && "bg-steel-50 dark:bg-steel-800/40",
                    )}
                  >
                    <p className="font-body text-sm font-semibold text-steel-900 dark:text-steel-50">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-steel-500 dark:text-steel-400">
                      {n.message}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-steel-400 dark:text-steel-500">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                );

                return n.actionUrl ? (
                  <Link
                    key={n.id}
                    to={n.actionUrl}
                    onClick={() => {
                      markAsRead(n.id);
                      setOpen(false);
                    }}
                    className="block cursor-pointer hover:bg-steel-50 dark:hover:bg-steel-800/60"
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    className="block w-full cursor-pointer text-left hover:bg-steel-50 dark:hover:bg-steel-800/60"
                  >
                    {body}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
