import { HydratedDocument, Types } from "mongoose";

export const STAFF_TASK_SHIFTS = ["DAY", "NIGHT"] as const;
export type StaffTaskShift = (typeof STAFF_TASK_SHIFTS)[number];

export const STAFF_TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type StaffTaskPriority = (typeof STAFF_TASK_PRIORITIES)[number];

export const STAFF_TASK_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
] as const;
export type StaffTaskStatus = (typeof STAFF_TASK_STATUSES)[number];

export interface IStaffTaskComment {
  authorId: Types.ObjectId;
  authorName: string;
  message: string;
  createdAt: Date;
}

export interface IStaffTask {
  staffId: Types.ObjectId;
  title: string;
  description: string;
  assignedDate: Date;
  shift: StaffTaskShift;
  priority: StaffTaskPriority;
  estimatedHours: number;
  overtimeHours: number;
  status: StaffTaskStatus;
  comments: IStaffTaskComment[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IStaffTaskDocument = HydratedDocument<IStaffTask>;

export interface StaffTaskDto {
  id: string;
  staffId: string;
  staffName: string;
  title: string;
  description: string;
  assignedDate: string;
  shift: StaffTaskShift;
  priority: StaffTaskPriority;
  estimatedHours: number;
  overtimeHours: number;
  status: StaffTaskStatus;
  comments: {
    authorId: string;
    authorName: string;
    message: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffTaskShiftSummaryDto {
  assignedHours: number;
  regularHours: number;
  overtimeHours: number;
  taskCount: number;
}

export interface StaffTaskStaffSummaryDto {
  staffId: string;
  staffName: string;
  attendanceStatus: string | null;
  attendanceMarked: boolean;
  dayShift: StaffTaskShiftSummaryDto;
  nightShift: StaffTaskShiftSummaryDto;
  nightShiftEligible: boolean;
  overtimeAuthorized: boolean;
  overtimeCapacityHours: number;
  dayAvailableHours: number;
  nightAvailableHours: number;
}

export interface StaffTaskDailyTotalsDto {
  taskCount: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  assignedHours: number;
  regularHours: number;
  overtimeHours: number;
}

export interface StaffTaskTodayDto {
  tasks: StaffTaskDto[];
  staffSummaries: StaffTaskStaffSummaryDto[];
  totals: StaffTaskDailyTotalsDto;
}

export interface StaffTaskHistoryDto {
  items: StaffTaskDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StaffTaskMonthlyWorkDayDto {
  date: string;
  attendanceStatus: string | null;
  completedHours: number;
  overtimeHours: number;
  taskCount: number;
  completedTaskCount: number;
}

export interface StaffTaskMonthlyStaffReportDto {
  staffId: string;
  staffName: string;
  completedHours: number;
  overtimeHours: number;
  eligibleWorkDays: number;
  averageCompletedHours: number;
  days: StaffTaskMonthlyWorkDayDto[];
}

export interface StaffTaskMonthlyReportDto {
  month: string;
  staff: StaffTaskMonthlyStaffReportDto[];
}
