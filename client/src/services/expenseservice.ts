import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  CreateExpensePayload,
  Expense,
  ExpenseListParams,
  UpdateExpensePayload,
} from "../types/expense";

export const expenseService = {
  /** GET /expenses?month=yyyy-MM&expenseType= — flat array, no pagination. */
  list: async (params: ExpenseListParams) => {
    const { data } = await apiClient.get<ApiResponse<Expense[]>>("/expenses", {
      params,
    });
    return data;
  },

  /** GET /expenses/:id */
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Expense>>(
      `/expenses/${id}`,
    );
    return data;
  },

  /** POST /expenses */
  create: async (payload: CreateExpensePayload) => {
    const { data } = await apiClient.post<ApiResponse<Expense>>(
      "/expenses",
      payload,
    );
    return data;
  },

  /** PATCH /expenses/:id */
  update: async (id: string, payload: UpdateExpensePayload) => {
    const { data } = await apiClient.patch<ApiResponse<Expense>>(
      `/expenses/${id}`,
      payload,
    );
    return data;
  },

  /** DELETE /expenses/:id */
  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(
      `/expenses/${id}`,
    );
    return data;
  },

  /** GET /expenses/export?month=yyyy-MM — non-deleted expenses for that month. */
  exportExcel: async (params: ExpenseListParams) => {
    return apiClient.get<Blob>("/expenses/export", {
      params,
      responseType: "blob",
    });
  },
};
