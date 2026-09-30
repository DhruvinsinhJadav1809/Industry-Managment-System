import { Types } from "mongoose";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import UserModel from "../../users/schemas/user.schema";
import {
  StaffExpenseType,
  StaffExpenseTypeValue,
} from "../constant/staff.constant";
import {
  CreateStaffExpenseDto,
  StaffLedgerQueryDto,
  StaffPeriodQueryDto,
  UpdateStaffExpenseDto,
} from "../dto/staff.dto";
import {
  StaffExpenseResponseDto,
  StaffLedgerMonthDto,
} from "../dto/staff.response.dto";
import StaffExpenseModel from "../schema/staff.expense.schema";
import { IStaffExpense } from "../types/staff.expense.types";

const validateStaff = async (staffId: string) => {
  const staff = await UserModel.findOne({
    _id: staffId,
    roleId: UserRole.Employee,
    isDeleted: false,
  });
  if (!staff) throw new NotFoundError("Staff user not found.");
  return staff;
};

const toExpenseResponse = (
  expense: IStaffExpense & { _id: Types.ObjectId },
): StaffExpenseResponseDto => ({
  id: expense._id.toString(),
  staffId: expense.staffId.toString(),
  expenseType: expense.expenseType,
  amount: expense.amount,
  expenseDate: expense.expenseDate,
  note: expense.note ?? null,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
});

const monthStart = (year: number, month: number) =>
  new Date(Date.UTC(year, month - 1, 1));
const nextMonthStart = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 1));

const calculateLedger = async (
  staffId: string,
  year: number,
  endMonth: number,
): Promise<StaffLedgerMonthDto[]> => {
  const staff = await validateStaff(staffId);
  const firstExpense = await StaffExpenseModel.findOne({ staffId })
    .sort({ expenseDate: 1 })
    .lean<IStaffExpense>();
  const firstDate = firstExpense?.expenseDate ?? monthStart(year, 1);
  const startYear = Math.min(year, firstDate.getUTCFullYear());
  const startMonth = startYear === year ? 1 : firstDate.getUTCMonth() + 1;
  const expenses = await StaffExpenseModel.find({
    staffId,
    expenseDate: {
      $gte: monthStart(startYear, startMonth),
      $lt: nextMonthStart(year, endMonth),
    },
  })
    .sort({ expenseDate: 1 })
    .lean<IStaffExpense[]>();
  const result: StaffLedgerMonthDto[] = [];
  let carry = 0;
  for (let currentYear = startYear; currentYear <= year; currentYear += 1) {
    const lastMonth = currentYear === year ? endMonth : 12;
    for (
      let month = currentYear === startYear ? startMonth : 1;
      month <= lastMonth;
      month += 1
    ) {
      const monthlyExpenses = expenses.filter(
        (expense) =>
          expense.expenseDate.getUTCFullYear() === currentYear &&
          expense.expenseDate.getUTCMonth() + 1 === month,
      );
      const totals: Record<StaffExpenseTypeValue, number> = {
        [StaffExpenseType.ADVANCE]: 0,
        [StaffExpenseType.MEDICAL]: 0,
        [StaffExpenseType.MEAL]: 0,
        [StaffExpenseType.TRANSPORT]: 0,
        [StaffExpenseType.MISC]: 0,
        [StaffExpenseType.DEDUCTION]: 0,
        [StaffExpenseType.BONUS]: 0,
      };
      for (const expense of monthlyExpenses)
        totals[expense.expenseType] += expense.amount;
      const totalExpenses =
        Object.values(totals).reduce((sum, amount) => sum + amount, 0) -
        totals[StaffExpenseType.BONUS];
      const salary = staff.monthlySalary ?? 0;
      const bonus = totals[StaffExpenseType.BONUS];
      const closingBalance = carry + salary + bonus - totalExpenses;
      result.push({
        month,
        year: currentYear,
        salary,
        totalBonus: bonus,
        totalAdvances: totals[StaffExpenseType.ADVANCE],
        totalMedical: totals[StaffExpenseType.MEDICAL],
        totalMeal: totals[StaffExpenseType.MEAL],
        totalTransport: totals[StaffExpenseType.TRANSPORT],
        totalMiscellaneous: totals[StaffExpenseType.MISC],
        totalDeductions: totals[StaffExpenseType.DEDUCTION],
        totalExpenses,
        openingCarryForward: carry,
        closingBalance,
        amountPayable: closingBalance,
      });
      carry = closingBalance;
    }
  }
  return result.filter((entry) => entry.year === year);
};

export const getSummary = async (
  staffId: string,
  query: StaffPeriodQueryDto,
) => {
  const ledger = await calculateLedger(staffId, query.year, query.month);
  return ledger[ledger.length - 1];
};

export const getLedger = async (staffId: string, query: StaffLedgerQueryDto) =>
  calculateLedger(staffId, query.year, 12);

export const getExpenses = async (staffId: string) => {
  await validateStaff(staffId);
  const expenses = await StaffExpenseModel.find({ staffId })
    .sort({ expenseDate: 1, createdAt: 1 })
    .lean<(IStaffExpense & { _id: Types.ObjectId })[]>();
  return expenses.map(toExpenseResponse);
};

export const createExpense = async (
  staffId: string,
  data: CreateStaffExpenseDto,
  currentUserId: string,
) => {
  await validateStaff(staffId);
  const expense = await StaffExpenseModel.create({
    ...data,
    staffId,
    createdBy: currentUserId,
  });
  return toExpenseResponse(expense);
};

export const updateExpense = async (
  staffId: string,
  expenseId: string,
  data: UpdateStaffExpenseDto,
  currentUserId: string,
) => {
  await validateStaff(staffId);
  const expense = await StaffExpenseModel.findOne({ _id: expenseId, staffId });
  if (!expense) throw new NotFoundError("Staff expense not found.");
  Object.assign(expense, data);
  expense.updatedBy = new Types.ObjectId(currentUserId);
  await expense.save();
  return toExpenseResponse(expense);
};
