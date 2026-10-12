import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  CreateNotificationPayload,
  NotificationHistoryItem,
} from "../types/notification";

export const notificationService = {
  create: async (payload: CreateNotificationPayload) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      "/notifications",
      payload,
    );
    return data;
  },
  list: async (pageSize = 50) => {
    const { data } = await apiClient.get<
      ApiResponse<{ items: NotificationHistoryItem[] }>
    >("/notifications", {
      params: { page: 1, pageSize },
    });
    return data.data.items;
  },
};
