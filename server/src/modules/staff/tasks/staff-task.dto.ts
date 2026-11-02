import {
  StaffTaskPriority,
  StaffTaskShift,
  StaffTaskStatus,
} from "./staff-task.types";

export interface CreateStaffTaskDto {
  staffId: string;
  title: string;
  description: string;
  assignedDate: string;
  shift: StaffTaskShift;
  priority: StaffTaskPriority;
  estimatedHours: number;
}

export interface UpdateStaffTaskDto {
  status?: StaffTaskStatus;
  comment?: string;
}

export interface StaffTaskHistoryQueryDto {
  from?: Date;
  to?: Date;
  staffId?: string;
  status?: StaffTaskStatus;
  page: number;
  pageSize: number;
}

export interface StaffTaskMonthlyReportQueryDto {
  month: string;
}
