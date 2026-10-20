import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  StaffRoom,
  StaffRoomAllocation,
  StaffRoomAllocationResult,
  StaffRoomPayload,
  StaffRoomTransferResult,
  UpdateStaffRoomPayload,
} from "../types/staffRoom";

export const staffRoomService = {
  getRooms: async () => {
    const { data } =
      await apiClient.get<ApiResponse<StaffRoom[]>>("/staff/rooms");
    return data;
  },

  createRoom: async (payload: StaffRoomPayload) => {
    const { data } = await apiClient.post<ApiResponse<StaffRoom>>(
      "/staff/rooms",
      payload,
    );
    return data;
  },

  updateRoom: async (roomId: string, payload: UpdateStaffRoomPayload) => {
    const { data } = await apiClient.patch<ApiResponse<StaffRoom>>(
      `/staff/rooms/${roomId}`,
      payload,
    );
    return data;
  },

  deleteRoom: async (roomId: string) => {
    const { data } = await apiClient.delete<ApiResponse<StaffRoom>>(
      `/staff/rooms/${roomId}`,
    );
    return data;
  },

  getRoomAllocations: async (roomId: string) => {
    const { data } = await apiClient.get<ApiResponse<StaffRoomAllocation[]>>(
      `/staff/rooms/${roomId}/allocations`,
    );
    return data;
  },

  getStaffRoomHistory: async (staffId: string) => {
    const { data } = await apiClient.get<ApiResponse<StaffRoomAllocation[]>>(
      `/staff/${staffId}/room-allocation/history`,
    );
    return data;
  },

  allocateStaff: async (roomId: string, staffIds: string[]) => {
    const { data } = await apiClient.post<
      ApiResponse<StaffRoomAllocationResult>
    >(`/staff/rooms/${roomId}/allocations`, { staffIds });
    return data;
  },

  transferStaff: async (staffId: string, roomId: string) => {
    const { data } = await apiClient.post<ApiResponse<StaffRoomTransferResult>>(
      `/staff/${staffId}/room-allocation/transfer`,
      { roomId },
    );
    return data;
  },

  vacateStaff: async (staffId: string) => {
    const { data } = await apiClient.delete<
      ApiResponse<StaffRoomTransferResult>
    >(`/staff/${staffId}/room-allocation`);
    return data;
  },
};
