import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { validateRequest } from "../../../middleware/validate-request";
import { UserRole } from "../../../shared/enums/user-role.enum";
import * as expenseController from "../controller/expense.controller";
import {
  createExpenseSchema,
  expenseFilterSchema,
  expenseIdSchema,
  updateExpenseSchema,
} from "../validation/expense.validation";

const router = Router();
const expenseRoles = [UserRole.Admin];

router.get(
  "/export",
  authenticate,
  authorize(expenseRoles),
  validateRequest(expenseFilterSchema, "query"),
  expenseController.exportExpenses,
);
router.post(
  "/",
  authenticate,
  authorize(expenseRoles),
  validateRequest(createExpenseSchema),
  expenseController.createExpense,
);
router.get(
  "/",
  authenticate,
  authorize(expenseRoles),
  validateRequest(expenseFilterSchema, "query"),
  expenseController.getExpenses,
);
router.get(
  "/:id",
  authenticate,
  authorize(expenseRoles),
  validateRequest(expenseIdSchema, "params"),
  expenseController.getExpenseById,
);
router.patch(
  "/:id",
  authenticate,
  authorize(expenseRoles),
  validateRequest(expenseIdSchema, "params"),
  validateRequest(updateExpenseSchema),
  expenseController.updateExpense,
);
router.delete(
  "/:id",
  authenticate,
  authorize(expenseRoles),
  validateRequest(expenseIdSchema, "params"),
  expenseController.deleteExpense,
);

export default router;
