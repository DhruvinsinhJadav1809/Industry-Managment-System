export type StaffExpenseType =
  | "ADVANCE"
  | "MEDICAL"
  | "MEAL"
  | "TRANSPORT"
  | "MISC"
  | "BONUS"
  | "DEDUCTION";

/** GET /staff/:staffId/summary?month=&year= */
export interface StaffSalarySummary {
  month: number;
  year: number;
  salary: number;
  totalAdvances: number;
  totalMedical: number;
  totalMeal: number;
  totalTransport: number;
  totalMiscellaneous: number;
  totalBonus?: number;
  totalDeductions?: number;
  totalExpenses: number;
  openingCarryForward: number;
  closingBalance: number;
  amountPayable: number;
}

/** GET /staff/:staffId/ledger?year= — one row per month, same shape as the summary. */
export type StaffLedgerRow = StaffSalarySummary;

/** GET /staff/:staffId/expenses */
export interface StaffExpense {
  id: string;
  staffId: string;
  expenseType: StaffExpenseType;
  amount: number;
  expenseDate: string; // ISO datetime
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffExpensePayload {
  expenseType: StaffExpenseType;
  amount: number;
  expenseDate: string; // yyyy-mm-dd
  note?: string;
}

/** PATCH /staff/:staffId/expenses/:expenseId */
export type UpdateStaffExpensePayload = Partial<CreateStaffExpensePayload>;

export interface StaffExpenseListParams {
  month?: number;
  year?: number;
}

export type StaffAttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "NIGHT_SHIFT"
  | "OVERTIME"
  | "WEEK_OFF"
  | "FESTIVAL_LEAVE";

export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  status: StaffAttendanceStatus;
  nightShift: boolean;
  overtimeHours: number;
}

export interface StaffAttendanceSummary {
  month: number;
  year: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  attendanceDays: number;
  weekOffs: number;
  festivalLeaves: number;
  nightShifts: number;
  overtimeDays: number;
  overtimeHours: number;
}

export interface StaffAttendanceMonth {
  records: StaffAttendanceRecord[];
  summary: StaffAttendanceSummary;
}

export interface UpsertStaffAttendancePayload {
  date: string;
  status: StaffAttendanceStatus;
  nightShift: boolean;
  overtimeHours: number;
}

export interface StaffDailyAttendanceInput {
  staffId: string;
  status: StaffAttendanceStatus;
  nightShift: boolean;
  overtimeHours: number;
}

export interface UpsertDailyStaffAttendancePayload {
  date: string;
  records: StaffDailyAttendanceInput[];
}

export interface StaffDailyAttendanceData {
  records: StaffAttendanceRecord[];
  submitted: boolean;
}
