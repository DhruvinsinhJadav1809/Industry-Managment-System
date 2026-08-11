import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { ROLES } from "../constants/roles";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  createdAt: string;
  read: boolean;
}

interface IncomingNotificationPayload {
  title: string;
  message: string;
  type: string;
  recipients: string[];
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  createdBy: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

// Assumes the socket server runs on the same host as the API, minus the
// `/api` suffix (e.g. VITE_API_BASE_URL=http://localhost:5000/api ->
// http://localhost:5000). Set VITE_SOCKET_URL explicitly if that's wrong.
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ??
  import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "");

const MAX_STORED = 50;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Real-time notifications are Staff-only for now.
  const isStaff = user?.roleId === ROLES.STAFF;

  useEffect(() => {
    if (!isStaff || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setNotifications([]);
      return;
    }

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join", user.id);

    socket.on("notification", (data: IncomingNotificationPayload) => {
      const notification: AppNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: data.title,
        message: data.message,
        type: data.type,
        metadata: data.metadata,
        actionUrl: data.actionUrl,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, MAX_STORED));
      toast.info(data.title);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isStaff, user, toast]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => setNotifications([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }),
    [notifications, unreadCount],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return ctx;
}
