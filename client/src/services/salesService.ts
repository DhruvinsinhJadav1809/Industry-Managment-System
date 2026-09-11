import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  CreateSalePayload,
  CreateSaleResult,
  SaleListData,
  SaleListParams,
} from "../types/sale";

export const saleService = {
  /** GET /sales?page&pageSize&search&customerId&status&sortBy&sortOrder */
  list: async (params: SaleListParams) => {
    const { data } = await apiClient.get<ApiResponse<SaleListData>>("/sales", {
      params,
    });
    return data;
  },

  /** POST /sales */
  create: async (payload: CreateSalePayload) => {
    const { data } = await apiClient.post<ApiResponse<CreateSaleResult>>(
      "/sales",
      payload,
    );
    return data;
  },

  // getById / update / remove / export land here once those endpoints
  // exist, mirroring how the Purchases module grew.
};
