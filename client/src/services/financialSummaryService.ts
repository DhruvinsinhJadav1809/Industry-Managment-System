import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type { FinancialSummary } from "../types/financialSummary";

export const financialSummaryService = {
  /**
   * Endpoint path assumed as GET /dashboard/financial-summary — you didn't
   * specify the route, only the response shape. Update the path below if
   * the real one differs; nothing else needs to change.
   */
  get: async () => {
    const { data } = await apiClient.get<ApiResponse<FinancialSummary>>(
      "/dashboard/financial-summary",
    );
    return data;
  },
};
