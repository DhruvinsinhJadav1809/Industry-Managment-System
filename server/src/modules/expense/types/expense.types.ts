import { Document, Types } from "mongoose";
import { ExpensePaymentTypeValue } from "../constant/expense.constant";

export interface IExpense {
  expenseType: string;
  amount: number;
  expenseDate: Date;
  paymentType: ExpensePaymentTypeValue;
  paidBy: Types.ObjectId;
  referenceNumber: string | null;
  note: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId | null;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpenseDocument extends IExpense, Document {}
