import { StaffExpenseTypeValue } from "../constant/staff.constant";

export interface CreateStaffExpenseDto {
  expenseType: StaffExpenseTypeValue;
  amount: number;
  expenseDate: Date;
  note: string | null;
}

export type UpdateStaffExpenseDto = Partial<CreateStaffExpenseDto>;

export interface StaffPeriodQueryDto {
  month: number;
  year: number;
}

export interface StaffLedgerQueryDto {
  year: number;
}
