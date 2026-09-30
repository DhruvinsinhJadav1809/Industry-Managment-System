import { ExpensePaymentTypeValue } from "../constant/expense.constant";

export interface ExpenseUserSummaryDto {
  id: string;
  name: string;
}

export interface ExpenseResponseDto {
  id: string;
  expenseType: string;
  amount: number;
  expenseDate: Date;
  paymentType: ExpensePaymentTypeValue;
  paidBy: ExpenseUserSummaryDto;
  referenceNumber: string | null;
  note: string | null;
  createdBy: ExpenseUserSummaryDto;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
