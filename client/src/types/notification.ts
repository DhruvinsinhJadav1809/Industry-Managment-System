export const NOTIFICATION_TYPES = [
  "PURCHASE",
  "SALE",
  "LOW_STOCK",
  "USER",
  "DEPARTMENT",
  "SYSTEM",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface CreateNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  recipients: string[];
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  createdAt: string;
  isRead: boolean;
}
