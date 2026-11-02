export type StaffLeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
export type StaffLeaveType = "FULL_DAY" | "HALF_DAY";

export interface StaffLeaveRequest {
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
  reviewedAt: string | null;
  createdAt: string;
}

export interface StaffLeaveHistory {
  items: StaffLeaveRequest[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateStaffLeaveRequestPayload {
  leaveType: StaffLeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface StaffLeaveHistoryParams {
  page: number;
  pageSize: number;
}

export interface ReviewStaffLeaveRequestPayload {
  status: Exclude<StaffLeaveStatus, "PENDING">;
  reason?: string;
}
