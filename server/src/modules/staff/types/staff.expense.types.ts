import { HydratedDocument, Types } from "mongoose";
import { StaffExpenseTypeValue } from "../constant/staff.constant";

export interface IStaffExpense {
  staffId: Types.ObjectId;
  expenseType: StaffExpenseTypeValue;
  amount: number;
  expenseDate: Date;
  note?: string | null;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IStaffExpenseDocument = HydratedDocument<IStaffExpense>;
