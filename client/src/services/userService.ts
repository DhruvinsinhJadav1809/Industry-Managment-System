import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  UpdateUserPayload,
  InviteUserPayload,
  UserInvitationPreviewRow,
  UserListData,
  UserListItem,
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
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<UserListItem>>(
      `/users/${id}`,
    );
    return data;
  },
  invite: async (payload: InviteUserPayload) => {
    const { data } = await apiClient.post<ApiResponse<null>>(
      "/users/invite",
      payload,
    );
    return data;
  },
  downloadImportTemplate: async () => {
    const { data } = await apiClient.get<Blob>("/users/bulk/template", {
      responseType: "blob",
    });
    return data;
  },
  previewBulkInvitations: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<
      ApiResponse<UserInvitationPreviewRow[]>
    >("/users/bulk/preview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  confirmBulkInvitations: async (
    rows: Array<{
      rowNumber: number;
      fullName: string;
      email: string;
      roleId: number;
    }>,
  ) => {
    const { data } = await apiClient.post<
      ApiResponse<UserInvitationPreviewRow[]>
    >("/users/bulk/confirm", { rows });
    return data;
  },
};
