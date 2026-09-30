import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { validateRequest } from "../../../middleware/validate-request";
import { UserRole } from "../../../shared/enums/user-role.enum";
import * as staffController from "../controller/staff.controller";
import {
  createStaffExpenseSchema,
  expenseParamsSchema,
  ledgerQuerySchema,
  staffIdSchema,
  summaryQuerySchema,
  updateStaffExpenseSchema,
} from "../validation/staff.validation";

const router = Router();
const adminOnly = [UserRole.Admin];

router.get(
  "/:staffId/summary",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffIdSchema, "params"),
  validateRequest(summaryQuerySchema, "query"),
  staffController.getSummary,
);
router.get(
  "/:staffId/ledger",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffIdSchema, "params"),
  validateRequest(ledgerQuerySchema, "query"),
  staffController.getLedger,
);
router.get(
  "/:staffId/expenses",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffIdSchema, "params"),
  staffController.getExpenses,
);
router.post(
  "/:staffId/expenses",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffIdSchema, "params"),
  validateRequest(createStaffExpenseSchema),
  staffController.createExpense,
);
router.patch(
  "/:staffId/expenses/:expenseId",
  authenticate,
  authorize(adminOnly),
  validateRequest(expenseParamsSchema, "params"),
  validateRequest(updateStaffExpenseSchema),
  staffController.updateExpense,
);

export default router;
