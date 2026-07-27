import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  CreateProductPayload,
  Product,
  ProductListData,
  ProductListParams,
  UpdateProductPayload,
} from "../types/product";

export const productService = {
  /** GET /products — assumed to follow the same list convention as /departments. */
  list: async (params: ProductListParams) => {
    const { data } = await apiClient.get<ApiResponse<ProductListData>>(
      "/products",
      { params }
    );
    return data;
  },

  /** GET /products/:id */
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Product>>(
      `/products/${id}`
    );
    return data;
  },

  /** POST /products */
  create: async (payload: CreateProductPayload) => {
    const { data } = await apiClient.post<ApiResponse<Product>>(
      "/products",
      payload
    );
    return data;
  },

  /** PUT /products/:id */
  update: async (id: string, payload: UpdateProductPayload) => {
    const { data } = await apiClient.put<ApiResponse<Product>>(
      `/products/${id}`,
      payload
    );
    return data;
  },

  /** DELETE /products/:id */
  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(
      `/products/${id}`
    );
    return data;
  },
};
