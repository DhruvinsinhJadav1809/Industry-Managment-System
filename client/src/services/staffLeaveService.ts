import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  CreateStaffLeaveRequestPayload,
  StaffLeaveHistory,
  StaffLeaveHistoryParams,
  StaffLeaveRequest,
  ReviewStaffLeaveRequestPayload,
} from "../types/staffLeave";

export const staffLeaveService = {
  getHistory: async (params: StaffLeaveHistoryParams) => {
    const { data } = await apiClient.get<ApiResponse<StaffLeaveHistory>>(
      "/staff/leaves",
      { params },
    );
    return data;
  },

  create: async (payload: CreateStaffLeaveRequestPayload) => {
    const { data } = await apiClient.post<ApiResponse<StaffLeaveRequest>>(
      "/staff/leaves",
      payload,
    );
    return data;
  },

  review: async (leaveId: string, payload: ReviewStaffLeaveRequestPayload) => {
    const { data } = await apiClient.patch<ApiResponse<StaffLeaveRequest>>(
      `/staff/leaves/${leaveId}`,
      payload,
    );
    return data;
  },
};
