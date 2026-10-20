export type StaffRoomStatus = "Active" | "Maintenance" | "Inactive";

export interface StaffRoom {
  id: string;
  roomNumber: string;
  floor: string;
  capacity: number;
  allocatedCount: number;
  availableCapacity: number;
  status: StaffRoomStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StaffRoomPayload {
  roomNumber: string;
  floor: string;
  capacity: number;
}

export type UpdateStaffRoomPayload = Partial<StaffRoomPayload> & {
  status?: StaffRoomStatus;
};

export interface StaffRoomPerson {
  id: string;
  fullName?: string;
  email?: string;
}

export interface StaffRoomAllocation {
  id: string;
  staff: StaffRoomPerson;
  room: {
    id: string;
    roomNumber: string;
    floor: string;
  };
  allocatedAt: string;
  vacatedAt: string | null;
  isActive: boolean;
}

export interface StaffRoomAllocationResult {
  room: StaffRoom;
  allocations: Array<{
    id: string;
    staffId: string;
    roomId: string;
    allocatedAt: string;
    vacatedAt: string | null;
    isActive: boolean;
  }>;
}

export interface StaffRoomTransferResult {
  id: string;
  staffId: string;
  roomId: string;
  roomNumber: string;
  allocatedAt: string;
  vacatedAt: string | null;
  isActive: boolean;
}
