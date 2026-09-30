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
