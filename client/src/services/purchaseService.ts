import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  CreatePurchasePayload,
  CreatePurchaseResult,
  PurchaseDetail,
  PurchaseListData,
  PurchaseListParams,
} from "../types/purchase";

export const purchaseService = {
  /** GET /purchases?page&pageSize&search&supplierId&status&sortBy&sortOrder */
  list: async (params: PurchaseListParams) => {
    const { data } = await apiClient.get<ApiResponse<PurchaseListData>>(
      "/purchases",
      { params },
    );
    return data;
  },

  /** GET /purchases/:id */
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<PurchaseDetail>>(
      `/purchases/${id}`,
    );
    return data;
  },

  /** POST /purchases */
  create: async (payload: CreatePurchasePayload) => {
    const { data } = await apiClient.post<ApiResponse<CreatePurchaseResult>>(
      "/purchases",
      payload,
    );
    return data;
  },

  /** GET /purchases/export — downloads the current filtered list as .xlsx. */
  exportExcel: async (
    params: Omit<PurchaseListParams, "page" | "pageSize">,
  ) => {
    return apiClient.get<Blob>("/purchases/export", {
      params,
      responseType: "blob",
    });
  },
  /** GET /purchases/:id/pdf */
  downloadPDF: async (id: string) => {
    return apiClient.get<Blob>(`/purchases/${id}/pdf`, {
      responseType: "blob", // critical: tells axios/fetch to return Blob, not JSON
    });
  },
  // No update/delete endpoints were provided — purchase records are
  // treated as immutable once created, which is standard for financial
  // documents. Add here if that changes.
};
