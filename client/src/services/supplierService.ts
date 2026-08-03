import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  CreateSupplierPayload,
  Supplier,
  SupplierListData,
  SupplierListParams,
  UpdateSupplierPayload,
} from "../types/supplier";

export const supplierService = {
  /** GET /suppliers?page&pageSize&search&isActive */
  list: async (params: SupplierListParams) => {
    const { data } = await apiClient.get<ApiResponse<SupplierListData>>(
      "/suppliers",
      { params },
    );
    return data;
  },

  /** GET /suppliers/:id */
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Supplier>>(
      `/suppliers/${id}`,
    );
    return data;
  },

  /** POST /suppliers */
  create: async (payload: CreateSupplierPayload) => {
    const { data } = await apiClient.post<ApiResponse<Supplier>>(
      "/suppliers",
      payload,
    );
    return data;
  },

  /** PUT /suppliers/:id — partial update, send only changed fields. */
  update: async (id: string, payload: UpdateSupplierPayload) => {
    const { data } = await apiClient.put<ApiResponse<Supplier>>(
      `/suppliers/${id}`,
      payload,
    );
    return data;
  },

  /** DELETE /suppliers/:id */
  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(
      `/suppliers/${id}`,
    );
    return data;
  },
  /**
   * GET /suppliers/export — downloads the current filtered list as .xlsx.
   * Returns the raw axios response (not just `.data`) since we need the
   * Content-Disposition header to read the server-provided filename, and
   * the body itself is a binary Blob rather than the usual JSON envelope.
   */
  exportExcel: async (
    params: Omit<SupplierListParams, "page" | "pageSize">,
  ) => {
    return apiClient.get<Blob>("/suppliers/export", {
      params,
      responseType: "blob",
    });
  },
};
