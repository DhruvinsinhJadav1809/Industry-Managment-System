export type StaffTaskShift = "DAY" | "NIGHT";
export type StaffTaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type StaffTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface StaffTaskComment {
  authorId: string;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface StaffTask {
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
  comments: StaffTaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface StaffTaskShiftSummary {
  assignedHours: number;
  regularHours: number;
  overtimeHours: number;
  taskCount: number;
}

export interface StaffTaskStaffSummary {
  staffId: string;
  staffName: string;
  attendanceStatus: string | null;
  attendanceMarked: boolean;
  dayShift: StaffTaskShiftSummary;
  nightShift: StaffTaskShiftSummary;
  nightShiftEligible: boolean;
  overtimeAuthorized: boolean;
  overtimeCapacityHours: number;
  dayAvailableHours: number;
  nightAvailableHours: number;
}

export interface StaffTaskDailyTotals {
  taskCount: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  assignedHours: number;
  regularHours: number;
  overtimeHours: number;
}

export interface StaffTaskToday {
  tasks: StaffTask[];
  staffSummaries: StaffTaskStaffSummary[];
  totals: StaffTaskDailyTotals;
}

export interface StaffTaskHistory {
  items: StaffTask[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StaffTaskMonthlyWorkDay {
  date: string;
  attendanceStatus: string | null;
  completedHours: number;
  overtimeHours: number;
  taskCount: number;
  completedTaskCount: number;
}

export interface StaffTaskMonthlyStaffReport {
  staffId: string;
  staffName: string;
  completedHours: number;
  overtimeHours: number;
  eligibleWorkDays: number;
  averageCompletedHours: number;
  days: StaffTaskMonthlyWorkDay[];
}

export interface StaffTaskMonthlyReport {
  month: string;
  staff: StaffTaskMonthlyStaffReport[];
}

export interface CreateStaffTaskPayload {
  staffId: string;
  title: string;
  description: string;
  assignedDate: string;
  shift: StaffTaskShift;
  priority: StaffTaskPriority;
  estimatedHours: number;
}

export interface UpdateStaffTaskPayload {
  status?: StaffTaskStatus;
  comment?: string;
}

export interface StaffTaskHistoryParams {
  from?: string;
  to?: string;
  staffId?: string;
  status?: StaffTaskStatus;
  page: number;
  pageSize: number;
}
