import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  CreateStaffTaskPayload,
  StaffTask,
  StaffTaskHistory,
  StaffTaskHistoryParams,
  StaffTaskMonthlyReport,
  StaffTaskToday,
  UpdateStaffTaskPayload,
} from "../types/staffTask";

export const staffTaskService = {
  getToday: async () => {
    const { data } = await apiClient.get<ApiResponse<StaffTaskToday>>(
      "/staff/tasks/today",
    );
    return data;
  },

  create: async (payload: CreateStaffTaskPayload) => {
    const { data } = await apiClient.post<ApiResponse<StaffTask>>(
      "/staff/tasks",
      payload,
    );
    return data;
  },

  getHistory: async (params: StaffTaskHistoryParams) => {
    const { data } = await apiClient.get<ApiResponse<StaffTaskHistory>>(
      "/staff/tasks/history",
      { params },
    );
    return data;
  },

  getMonthlyWorkReport: async (month: string) => {
    const { data } = await apiClient.get<ApiResponse<StaffTaskMonthlyReport>>(
      "/staff/tasks/monthly-report",
      { params: { month } },
    );
    return data;
  },

  update: async (taskId: string, payload: UpdateStaffTaskPayload) => {
    const { data } = await apiClient.patch<ApiResponse<StaffTask>>(
      `/staff/tasks/${taskId}`,
      payload,
    );
    return data;
  },
};
