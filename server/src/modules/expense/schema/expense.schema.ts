import { Schema, model } from "mongoose";
import { IExpenseDocument } from "../types/expense.types";
import { ExpensePaymentType } from "../constant/expense.constant";

const expenseSchema = new Schema<IExpenseDocument>(
  {
    expenseType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    expenseDate: { type: Date, required: true, index: true },
    paymentType: {
      type: String,
      enum: Object.values(ExpensePaymentType),
      required: true,
      index: true,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    note: { type: String, trim: true, maxlength: 500, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export default model<IExpenseDocument>("Expense", expenseSchema);
