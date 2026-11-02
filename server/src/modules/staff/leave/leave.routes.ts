import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { validateRequest } from "../../../middleware/validate-request";
import { UserRole } from "../../../shared/enums/user-role.enum";
import * as staffLeaveController from "./leave.controller";
import {
  createStaffLeaveRequestSchema,
  reviewStaffLeaveRequestSchema,
  staffLeaveHistoryQuerySchema,
  staffLeaveRequestIdSchema,
} from "./leave.validation";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize([UserRole.Admin, UserRole.Employee]),
  validateRequest(staffLeaveHistoryQuerySchema, "query"),
  staffLeaveController.getLeaveHistory,
);
router.post(
  "/",
  authenticate,
  authorize([UserRole.Employee]),
  validateRequest(createStaffLeaveRequestSchema),
  staffLeaveController.createLeaveRequest,
);
router.patch(
  "/:leaveId",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(staffLeaveRequestIdSchema, "params"),
  validateRequest(reviewStaffLeaveRequestSchema),
  staffLeaveController.reviewLeaveRequest,
);

export default router;
