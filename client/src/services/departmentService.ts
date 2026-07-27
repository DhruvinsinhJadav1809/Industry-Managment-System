import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  AssignManagerPayload,
  CreateDepartmentPayload,
  Department,
  DepartmentListData,
  DepartmentListItem,
  DepartmentListParams,
  UpdateDepartmentPayload,
} from "../types/department";

export const departmentService = {
  /** GET /departments — paginated, searchable, sortable. */
  list: async (params: DepartmentListParams) => {
    const { data } = await apiClient.get<ApiResponse<DepartmentListData>>(
      "/departments",
      { params }
    );
    return data;
  },

  /** GET /departments/:id */
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<DepartmentListItem>>(
      `/departments/${id}`
    );
    return data;
  },

  /** POST /departments */
  create: async (payload: CreateDepartmentPayload) => {
    const { data } = await apiClient.post<ApiResponse<Department>>(
      "/departments",
      payload
    );
    return data;
  },

  /** PUT /departments/:id — managerId is not sent here, see assignManager. */
  update: async (id: string, payload: UpdateDepartmentPayload) => {
    const { data } = await apiClient.put<ApiResponse<Department>>(
      `/departments/${id}`,
      payload
    );
    return data;
  },

  /** DELETE /departments/:id */
  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(
      `/departments/${id}`
    );
    return data;
  },

  /** PATCH /departments/:id/manager */
  assignManager: async (id: string, payload: AssignManagerPayload) => {
    const { data } = await apiClient.patch<ApiResponse<Department>>(
      `/departments/${id}/manager`,
      payload
    );
    return data;
  },
};
