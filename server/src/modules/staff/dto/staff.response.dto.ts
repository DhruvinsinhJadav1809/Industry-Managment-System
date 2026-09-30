import { StaffExpenseTypeValue } from "../constant/staff.constant";

export interface StaffExpenseResponseDto {
  id: string;
  staffId: string;
  expenseType: StaffExpenseTypeValue;
  amount: number;
  expenseDate: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffLedgerMonthDto {
  month: number;
  year: number;
  salary: number;
  totalBonus: number;
  totalAdvances: number;
  totalMedical: number;
  totalMeal: number;
  totalTransport: number;
  totalMiscellaneous: number;
  totalDeductions: number;
  totalExpenses: number;
  openingCarryForward: number;
  closingBalance: number;
  amountPayable: number;
}

export type StaffSummaryDto = StaffLedgerMonthDto;
