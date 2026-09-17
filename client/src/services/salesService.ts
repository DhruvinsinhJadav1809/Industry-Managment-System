import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  CreateSalePayload,
  CreateSaleResult,
  SaleListData,
  SaleListItem,
  SaleListParams,
  UpdateSalePaymentPayload,
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
  /** PATCH /sales/:id/payment */
  updatePayment: async (saleId: string, payload: UpdateSalePaymentPayload) => {
    const { data } = await apiClient.patch<ApiResponse<SaleListItem>>(
      `/sales/${saleId}/payment`,
      payload,
    );

    return data;
  },
  /** GET /purchases/export — downloads the current filtered list as .xlsx. */
  exportExcel: async (params: Omit<SaleListParams, "page" | "pageSize">) => {
    return apiClient.get<Blob>("/sales/export", {
      params,
      responseType: "blob",
    });
  },
  /** GET /purchases/:id */
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<SaleListItem>>(
      `/sales/${id}`,
    );
    return data;
  },

  downloadPDF: async (id: string) => {
    return apiClient.get<Blob>(`/sales/${id}/pdf`, {
      responseType: "blob", // critical: tells axios/fetch to return Blob, not JSON
    });
  },
};
