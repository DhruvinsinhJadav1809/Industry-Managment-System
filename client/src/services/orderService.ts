import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  AcceptOrderItemInput,
  CustomerOrder,
  OrderItemInput,
  OrderListData,
  OrderListParams,
  OrderSummaryData,
} from "../types/order";

export const orderService = {
  /** GET /orders — expected to return the caller's orders, or all orders for admins. */
  list: async (params: OrderListParams) => {
    const { data } = await apiClient.get<ApiResponse<OrderListData>>(
      "/orders",
      {
        params,
      },
    );
    return data;
  },

  /** GET /orders/summary — all non-deleted orders grouped by status. */
  summary: async () => {
    const { data } =
      await apiClient.get<ApiResponse<OrderSummaryData>>("/orders/summary");
    return data;
  },

  /** POST /orders */
  create: async (items: OrderItemInput[]) => {
    const { data } = await apiClient.post<ApiResponse<CustomerOrder>>(
      "/orders",
      {
        items,
      },
    );
    return data;
  },

  /** PATCH /orders/:id — modify a pending order or cancel it. */
  update: async (
    id: string,
    payload:
      | { action: "modify"; items: OrderItemInput[] }
      | { action: "cancel" },
  ) => {
    const { data } = await apiClient.patch<ApiResponse<CustomerOrder>>(
      `/orders/${id}`,
      payload,
    );
    return data;
  },

  /** PATCH /orders/:id/accept */
  accept: async (id: string, items: AcceptOrderItemInput[]) => {
    const { data } = await apiClient.patch<ApiResponse<CustomerOrder>>(
      `/orders/${id}/accept`,
      { items },
    );
    return data;
  },
};
