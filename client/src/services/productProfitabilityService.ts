import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type { ProductProfitabilityData } from "../types/productProfitability";

export const productProfitabilityService = {
  /** GET /product-profitability — no query params. */
  get: async () => {
    const { data } = await apiClient.get<ApiResponse<ProductProfitabilityData>>(
      "dashboard/product-profitability",
    );
    return data;
  },
};
