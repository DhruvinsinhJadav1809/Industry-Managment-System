import {
  ExpensePaymentTypeValue,
  ExpenseTypeValue,
} from "../constant/expense.constant";

export interface CreateExpenseDto {
  expenseType: ExpenseTypeValue;
  amount: number;
  expenseDate: Date;
  paymentType: ExpensePaymentTypeValue;
  paidBy: string;
  referenceNumber: string | null;
  note: string | null;
}

export type UpdateExpenseDto = Partial<CreateExpenseDto>;

export interface GetExpensesQueryDto {
  month: string;
  expenseType?: ExpenseTypeValue;
}
