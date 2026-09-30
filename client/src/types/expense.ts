export interface ExpenseUser {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  expenseType: string;
  amount: number;
  expenseDate: string; // ISO datetime
  paymentType: string;
  paidBy: string | ExpenseUser;
  referenceNumber?: string;
  note?: string;
  createdBy: ExpenseUser;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  expenseType: string;
  amount: number;
  expenseDate: string; // yyyy-mm-dd
  paymentType: string;
  paidBy: string;
  referenceNumber?: string;
  note?: string;
}

/** PATCH /expenses/:id accepts a partial update. */
export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface ExpenseListParams {
  month: string; // yyyy-MM
  expenseType?: string;
}
