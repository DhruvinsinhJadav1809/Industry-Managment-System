import { model, Schema } from "mongoose";
import { STAFF_EXPENSE_TYPES } from "../constant/staff.constant";
import { IStaffExpenseDocument } from "../types/staff.expense.types";

const staffExpenseSchema = new Schema<IStaffExpenseDocument>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expenseType: {
      type: String,
      enum: STAFF_EXPENSE_TYPES,
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    expenseDate: { type: Date, required: true, index: true },
    note: { type: String, trim: true, maxlength: 500, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export default model<IStaffExpenseDocument>("StaffExpense", staffExpenseSchema);
