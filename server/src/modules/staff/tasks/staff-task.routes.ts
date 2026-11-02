import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { validateRequest } from "../../../middleware/validate-request";
import { UserRole } from "../../../shared/enums/user-role.enum";
import * as staffTaskController from "./staff-task.controller";
import {
  createStaffTaskSchema,
  staffTaskHistoryQuerySchema,
  staffTaskMonthlyReportQuerySchema,
  staffTaskStatusParamsSchema,
  updateStaffTaskSchema,
} from "./staff-task.validation";

const router = Router();

router.get(
  "/today",
  authenticate,
  authorize([UserRole.Admin, UserRole.Employee]),
  staffTaskController.getTodayTasks,
);
router.post(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(createStaffTaskSchema),
  staffTaskController.createTask,
);
router.get(
  "/history",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(staffTaskHistoryQuerySchema, "query"),
  staffTaskController.getHistory,
);
router.get(
  "/monthly-report",
  authenticate,
  authorize([UserRole.Admin, UserRole.Employee]),
  validateRequest(staffTaskMonthlyReportQuerySchema, "query"),
  staffTaskController.getMonthlyWorkReport,
);
router.patch(
  "/:taskId",
  authenticate,
  authorize([UserRole.Employee]),
  validateRequest(staffTaskStatusParamsSchema, "params"),
  validateRequest(updateStaffTaskSchema),
  staffTaskController.updateTask,
);

export default router;
