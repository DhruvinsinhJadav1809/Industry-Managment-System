import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  AssignEmployeeAssetPayload,
  CreateEmployeeAssetReleaseRequestPayload,
  CreateEmployeeAssetPayload,
  EmployeeAsset,
  MyEmployeeAsset,
} from "../types/employeeAsset";

export const employeeAssetService = {
  getAll: async () => {
    const { data } =
      await apiClient.get<ApiResponse<EmployeeAsset[]>>("/staff/assets");
    return data;
  },

  getMine: async () => {
    const { data } = await apiClient.get<ApiResponse<MyEmployeeAsset[]>>(
      "/staff/assets/mine",
    );
    return data;
  },

  create: async (payload: CreateEmployeeAssetPayload) => {
    const { data } = await apiClient.post<ApiResponse<EmployeeAsset>>(
      "/staff/assets",
      payload,
    );
    return data;
  },

  assign: async (assetId: string, payload: AssignEmployeeAssetPayload) => {
    const { data } = await apiClient.post<ApiResponse<EmployeeAsset>>(
      `/staff/assets/${assetId}/assign`,
      payload,
    );
    return data;
  },

  requestRelease: async (
    assetId: string,
    payload: CreateEmployeeAssetReleaseRequestPayload,
  ) => {
    const { data } = await apiClient.post(
      `/staff/assets/${assetId}/release-requests`,
      payload,
    );
    return data;
  },

  reviewReleaseRequest: async (
    assetId: string,
    requestId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    const { data } = await apiClient.patch(
      `/staff/assets/${assetId}/release-requests/${requestId}`,
      { status },
    );
    return data;
  },

  reassign: async (
    assetId: string,
    staffId: string,
    newStaffId: string,
  ) => {
    const { data } = await apiClient.patch<ApiResponse<EmployeeAsset>>(
      `/staff/assets/${assetId}/assignments/${staffId}`,
      { newStaffId },
    );
    return data;
  },

  removeAssignment: async (assetId: string, staffId: string) => {
    const { data } = await apiClient.delete<ApiResponse<EmployeeAsset>>(
      `/staff/assets/${assetId}/assignments/${staffId}`,
    );
    return data;
  },

  remove: async (assetId: string) => {
    const { data } = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/staff/assets/${assetId}`,
    );
    return data;
  },
};
