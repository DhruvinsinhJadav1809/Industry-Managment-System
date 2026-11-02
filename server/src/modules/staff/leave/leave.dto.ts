import { StaffLeaveStatus, StaffLeaveType } from "./leave.types";

export interface CreateStaffLeaveRequestDto {
  leaveType: StaffLeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ReviewStaffLeaveRequestDto {
  status: Exclude<StaffLeaveStatus, "PENDING">;
  reason?: string;
}

export interface StaffLeaveHistoryQueryDto {
  page: number;
  pageSize: number;
}
