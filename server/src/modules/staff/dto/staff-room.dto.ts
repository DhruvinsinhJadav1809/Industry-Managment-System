import { StaffRoomStatus } from "../types/staff-room.types";

export interface CreateStaffRoomDto {
  roomNumber: string;
  floor: string;
  capacity: number;
}

export interface UpdateStaffRoomDto {
  roomNumber?: string;
  floor?: string;
  capacity?: number;
  status?: StaffRoomStatus;
}

export interface AllocateStaffRoomDto {
  staffIds: string[];
}

export interface TransferStaffRoomDto {
  roomId: string;
}
