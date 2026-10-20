import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  CreateStaffExpensePayload,
  StaffExpense,
  StaffExpenseListParams,
  StaffAttendanceMonth,
  StaffAttendanceRecord,
  StaffDailyAttendanceData,
  UpsertDailyStaffAttendancePayload,
  StaffLedgerRow,
  StaffSalarySummary,
  UpsertStaffAttendancePayload,
  UpdateStaffExpensePayload,
} from "../types/staff";

export const staffService = {
  getDailyAttendance: async (date: string) => {
    const { data } = await apiClient.get<ApiResponse<StaffDailyAttendanceData>>(
      "/staff/attendance/daily",
      { params: { date } },
    );
    return data;
  },

  saveDailyAttendance: async (payload: UpsertDailyStaffAttendancePayload) => {
    const { data } = await apiClient.put<ApiResponse<StaffDailyAttendanceData>>(
      "/staff/attendance/daily",
      payload,
    );
    return data;
  },

  getMyMonthlyAttendance: async (month: number, year: number) => {
    const { data } = await apiClient.get<ApiResponse<StaffAttendanceMonth>>(
      "/staff/me/attendance",
      { params: { month, year } },
    );
    return data;
  },

  getMonthlyAttendance: async (
    staffId: string,
    month: number,
    year: number,
  ) => {
    const { data } = await apiClient.get<ApiResponse<StaffAttendanceMonth>>(
      `/staff/${staffId}/attendance`,
      { params: { month, year } },
    );
    return data;
  },

  saveAttendance: async (
    staffId: string,
    payload: UpsertStaffAttendancePayload,
  ) => {
    const { data } = await apiClient.put<ApiResponse<StaffAttendanceRecord>>(
      `/staff/${staffId}/attendance`,
      payload,
    );
    return data;
  },

  /** GET /staff/:staffId/summary?month=&year= */
  getStaffSalarySummary: async (
    staffId: string,
    month: number,
    year: number,
  ) => {
    const { data } = await apiClient.get<ApiResponse<StaffSalarySummary>>(
      `/staff/${staffId}/summary`,
      { params: { month, year } },
    );
    return data;
  },

  /** GET /staff/:staffId/ledger?year= */
  getStaffLedger: async (staffId: string, year: number) => {
    const { data } = await apiClient.get<ApiResponse<StaffLedgerRow[]>>(
      `/staff/${staffId}/ledger`,
      { params: { year } },
    );
    return data;
  },

  /** GET /staff/:staffId/expenses[?month=&year=] */
  getStaffExpenses: async (
    staffId: string,
    params?: StaffExpenseListParams,
  ) => {
    const { data } = await apiClient.get<ApiResponse<StaffExpense[]>>(
      `/staff/${staffId}/expenses`,
      { params },
    );
    return data;
  },

  /** POST /staff/:staffId/expenses */
  createStaffExpense: async (
    staffId: string,
    payload: CreateStaffExpensePayload,
  ) => {
    const { data } = await apiClient.post<ApiResponse<StaffExpense>>(
      `/staff/${staffId}/expenses`,
      payload,
    );
    return data;
  },

  /** PATCH /staff/:staffId/expenses/:expenseId */
  updateStaffExpense: async (
    staffId: string,
    expenseId: string,
    payload: UpdateStaffExpensePayload,
  ) => {
    const { data } = await apiClient.patch<ApiResponse<StaffExpense>>(
      `/staff/${staffId}/expenses/${expenseId}`,
      payload,
    );
    return data;
  },
};
