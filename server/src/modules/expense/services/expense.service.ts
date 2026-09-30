import { Response as ExpressResponse } from "express";
import { QueryFilter, Types } from "mongoose";
import UserModel from "../../users/schemas/user.schema";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { ExcelService } from "../../../shared/excel/excel.service";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { ExpensePaymentTypeValue } from "../constant/expense.constant";
import {
  CreateExpenseDto,
  GetExpensesQueryDto,
  UpdateExpenseDto,
} from "../dto/expense.dto";
import {
  ExpenseResponseDto,
  ExpenseUserSummaryDto,
} from "../dto/expense.response.dto";
import ExpenseModel from "../schema/expense.schema";
import { IExpense, IExpenseDocument } from "../types/expense.types";

interface PopulatedExpenseUser {
  _id: Types.ObjectId;
  fullName: string;
}

type ExpenseRecord = Omit<
  IExpenseDocument | IExpense,
  "paidBy" | "createdBy"
> & {
  _id: Types.ObjectId;
  paidBy: Types.ObjectId | PopulatedExpenseUser;
  createdBy: Types.ObjectId | PopulatedExpenseUser;
};

const toUserSummary = (
  user: Types.ObjectId | PopulatedExpenseUser,
): ExpenseUserSummaryDto => ({
  id: user instanceof Types.ObjectId ? user.toString() : user._id.toString(),
  name: user instanceof Types.ObjectId ? "" : user.fullName,
});

const toExpenseResponse = (expense: ExpenseRecord): ExpenseResponseDto => ({
  id: expense._id.toString(),
  expenseType: expense.expenseType,
  amount: expense.amount,
  expenseDate: expense.expenseDate,
  paymentType: expense.paymentType,
  paidBy: toUserSummary(expense.paidBy),
  referenceNumber: expense.referenceNumber,
  note: expense.note,
  createdBy: toUserSummary(expense.createdBy),
  updatedBy: expense.updatedBy?.toString() ?? null,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
});

const validatePaidBy = async (paidBy: string): Promise<void> => {
  const user = await UserModel.findOne({
    _id: paidBy,
    isDeleted: false,
    isActive: true,
    roleId: { $in: [UserRole.Admin, UserRole.Employee] },
  });

  if (!user) {
    throw new NotFoundError(
      "Selected paid-by user not found or is not eligible.",
    );
  }
};

const getMonthRange = (month: string): { start: Date; end: Date } => {
  const [year, monthNumber] = month.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1)),
    end: new Date(Date.UTC(year, monthNumber, 1)),
  };
};

const buildFilter = (query: GetExpensesQueryDto): QueryFilter<IExpense> => {
  const { start, end } = getMonthRange(query.month);
  const filter: QueryFilter<IExpense> = { isDeleted: false };
  filter.expenseDate = { $gte: start, $lt: end };
  if (query.expenseType) filter.expenseType = query.expenseType;

  return filter;
};

export const createExpense = async (
  data: CreateExpenseDto,
  currentUserId: string,
): Promise<ExpenseResponseDto> => {
  await validatePaidBy(data.paidBy);
  const expense = await ExpenseModel.create({
    ...data,
    createdBy: currentUserId,
  });
  await expense.populate([
    { path: "paidBy", select: "fullName" },
    { path: "createdBy", select: "fullName" },
  ]);
  return toExpenseResponse(expense);
};

export const getExpenses = async (
  query: GetExpensesQueryDto,
): Promise<ExpenseResponseDto[]> => {
  const filter = buildFilter(query);
  const expenses = await ExpenseModel.find(filter)
    .populate("paidBy", "fullName")
    .populate("createdBy", "fullName")
    .sort({ expenseDate: "asc", createdAt: "asc" })
    .lean<ExpenseRecord[]>();
  return expenses.map(toExpenseResponse);
};

export const getExpenseById = async (
  expenseId: string,
): Promise<ExpenseResponseDto> => {
  const expense = await ExpenseModel.findOne({
    _id: expenseId,
    isDeleted: false,
  })
    .populate("paidBy", "fullName")
    .populate("createdBy", "fullName")
    .lean<ExpenseRecord>();
  if (!expense) throw new NotFoundError("Expense not found.");
  return toExpenseResponse(expense);
};

export const updateExpense = async (
  expenseId: string,
  data: UpdateExpenseDto,
  currentUserId: string,
): Promise<ExpenseResponseDto> => {
  const expense = await ExpenseModel.findOne({
    _id: expenseId,
    isDeleted: false,
  });
  if (!expense) throw new NotFoundError("Expense not found.");
  if (data.paidBy) await validatePaidBy(data.paidBy);

  Object.assign(expense, data);
  expense.updatedBy = new Types.ObjectId(currentUserId);
  await expense.save();
  await expense.populate([
    { path: "paidBy", select: "fullName" },
    { path: "createdBy", select: "fullName" },
  ]);
  return toExpenseResponse(expense);
};

export const deleteExpense = async (
  expenseId: string,
  currentUserId: string,
): Promise<void> => {
  const expense = await ExpenseModel.findOne({
    _id: expenseId,
    isDeleted: false,
  });
  if (!expense) throw new NotFoundError("Expense not found.");

  expense.isDeleted = true;
  expense.deletedAt = new Date();
  expense.deletedBy = new Types.ObjectId(currentUserId);
  await expense.save();
};

interface ExpenseExportRow {
  expenseType: string;
  amount: number;
  expenseDate: Date;
  paymentType: ExpensePaymentTypeValue;
  paidBy: PopulatedExpenseUser | null;
  referenceNumber: string | null;
  note: string | null;
  createdBy: PopulatedExpenseUser | null;
  createdAt: Date;
  updatedAt: Date;
}

export const exportExpenses = async (
  query: GetExpensesQueryDto,
  res: ExpressResponse,
): Promise<void> => {
  const expenses = await ExpenseModel.find(buildFilter(query))
    .populate("paidBy", "fullName")
    .populate("createdBy", "fullName")
    .sort({ expenseDate: "desc" })
    .lean<ExpenseExportRow[]>();

  await ExcelService.generateExcel(
    {
      sheetName: "Expenses",
      fileName: "expenses",
      columns: [
        { header: "Expense Type", key: "expenseType", width: 25 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Expense Date", key: "expenseDate", width: 18 },
        { header: "Payment Type", key: "paymentType", width: 15 },
        { header: "Paid By", key: "paidBy", width: 25 },
        { header: "Reference Number", key: "referenceNumber", width: 22 },
        { header: "Note", key: "note", width: 40 },
        { header: "Created By", key: "createdBy", width: 25 },
        { header: "Created At", key: "createdAt", width: 22 },
        { header: "Updated At", key: "updatedAt", width: 22 },
      ],
      data: expenses.map((expense) => ({
        ...expense,
        paidBy: expense.paidBy?.fullName ?? "-",
        createdBy: expense.createdBy?.fullName ?? "-",
        referenceNumber: expense.referenceNumber ?? "-",
        note: expense.note ?? "-",
      })),
    },
    res,
  );
};
