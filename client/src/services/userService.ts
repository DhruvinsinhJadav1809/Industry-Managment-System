import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  UpdateUserPayload,
  UserListData,
  UserListParams,
} from "../types/user";

export const userService = {
  /**
   * GET /users — paginated, searchable, filterable, sortable user list.
   * Admin only (enforced both by route guard and by the API itself).
   */
  list: async (params: UserListParams) => {
    const { data } = await apiClient.get<ApiResponse<UserListData>>("/users", {
      params,
    });
    return data;
  },

  /**
   * Put /users/:id — endpoint assumed, update once the real contract
   * is confirmed. Only the fields below are sent.
   */
  update: async (id: string, payload: UpdateUserPayload) => {
    const { data } = await apiClient.put<ApiResponse<unknown>>(
      `/users/${id}`,
      payload,
    );
    return data;
  },

  /**
   * DELETE /users/:id — endpoint assumed, update once confirmed.
   */
  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(
      `/users/${id}`,
    );
    return data;
  },
};
