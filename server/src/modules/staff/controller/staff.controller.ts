import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import {
  CreateStaffExpenseDto,
  StaffLedgerQueryDto,
  StaffPeriodQueryDto,
  UpdateStaffExpenseDto,
} from "../dto/staff.dto";
import * as staffService from "../services/staff.service";

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await staffService.getSummary(
    String(req.params.staffId),
    res.locals.validated as StaffPeriodQueryDto,
  );
  return res.json(
    successResponse(summary, "Staff salary summary retrieved successfully."),
  );
});

export const getLedger = asyncHandler(async (req, res) => {
  const ledger = await staffService.getLedger(
    String(req.params.staffId),
    res.locals.validated as StaffLedgerQueryDto,
  );
  return res.json(
    successResponse(ledger, "Staff ledger retrieved successfully."),
  );
});

export const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await staffService.getExpenses(String(req.params.staffId));
  return res.json(
    successResponse(expenses, "Staff expenses retrieved successfully."),
  );
});

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await staffService.createExpense(
    String(req.params.staffId),
    req.body as CreateStaffExpenseDto,
    req.user.id,
  );
  return res
    .status(201)
    .json(successResponse(expense, "Staff expense created successfully."));
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await staffService.updateExpense(
    String(req.params.staffId),
    String(req.params.expenseId),
    req.body as UpdateStaffExpenseDto,
    req.user.id,
  );
  return res.json(
    successResponse(expense, "Staff expense updated successfully."),
  );
});
