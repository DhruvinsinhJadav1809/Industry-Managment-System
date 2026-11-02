import { HydratedDocument, Types } from "mongoose";

export const STAFF_LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type StaffLeaveStatus = (typeof STAFF_LEAVE_STATUSES)[number];

export const STAFF_LEAVE_TYPES = ["FULL_DAY", "HALF_DAY"] as const;
export type StaffLeaveType = (typeof STAFF_LEAVE_TYPES)[number];

export interface IStaffLeaveRequest {
  staffId: Types.ObjectId;
  staffName: string;
  leaveType: StaffLeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: StaffLeaveStatus;
  reviewReason: string | null;
  reviewedBy: Types.ObjectId | null;
  reviewedByName: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IStaffLeaveRequestDocument = HydratedDocument<IStaffLeaveRequest>;

export interface StaffLeaveRequestDto {
  id: string;
  staffId: string;
  staffName: string;
  leaveType: StaffLeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: StaffLeaveStatus;
  reviewReason: string | null;
  reviewedByName: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

export interface StaffLeaveHistoryDto {
  items: StaffLeaveRequestDto[];
  total: number;
  page: number;
  pageSize: number;
}
