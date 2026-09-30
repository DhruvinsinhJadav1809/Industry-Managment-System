import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import { GetExpensesQueryDto, UpdateExpenseDto } from "../dto/expense.dto";
import * as expenseService from "../services/expense.service";

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.body, req.user.id);
  return res
    .status(201)
    .json(successResponse(expense, "Expense created successfully."));
});

export const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await expenseService.getExpenses(
    res.locals.validated as GetExpensesQueryDto,
  );
  return res.json(
    successResponse(expenses, "Expenses retrieved successfully."),
  );
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(String(req.params.id));
  return res.json(successResponse(expense, "Expense retrieved successfully."));
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(
    String(req.params.id),
    req.body as UpdateExpenseDto,
    req.user.id,
  );
  return res.json(successResponse(expense, "Expense updated successfully."));
});

export const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(String(req.params.id), req.user.id);
  return res.json(successResponse(null, "Expense deleted successfully."));
});

export const exportExpenses = asyncHandler(async (req, res) => {
  await expenseService.exportExpenses(
    res.locals.validated as GetExpensesQueryDto,
    res,
  );
});
