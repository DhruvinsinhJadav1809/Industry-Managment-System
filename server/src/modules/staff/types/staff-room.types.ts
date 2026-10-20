import { Document, Types } from "mongoose";

export enum StaffRoomStatus {
  ACTIVE = "Active",
  MAINTENANCE = "Maintenance",
  INACTIVE = "Inactive",
}

export interface IStaffRoom {
  roomNumber: string;
  floor: string;
  capacity: number;
  allocatedCount: number;
  status: StaffRoomStatus;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStaffRoomDocument extends IStaffRoom, Document {}

export interface IStaffRoomAllocation {
  roomId: Types.ObjectId;
  staffId: Types.ObjectId;
  allocatedAt: Date;
  vacatedAt: Date | null;
  isActive: boolean;
  allocatedBy: Types.ObjectId;
  vacatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStaffRoomAllocationDocument
  extends IStaffRoomAllocation, Document {}
