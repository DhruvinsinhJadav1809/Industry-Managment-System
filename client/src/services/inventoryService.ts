import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  InventoryItem,
  InventoryListData,
  InventoryListParams,
} from "../types/inventory";

export const inventoryService = {
  /** GET /inventory?page&pageSize */
  list: async (params: InventoryListParams) => {
    const { data } = await apiClient.get<ApiResponse<InventoryListData>>(
      "/inventory",
      { params },
    );
    return data;
  },

  /** GET /inventory/low-stock — flat array, no pagination. */
  lowStock: async () => {
    const { data } = await apiClient.get<ApiResponse<InventoryItem[]>>(
      "/inventory/low-stock",
    );
    return data;
  },
};
