import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { validateRequest } from "../../../middleware/validate-request";
import { UserRole } from "../../../shared/enums/user-role.enum";
import * as staffController from "../controller/staff.controller";
import {
  staffAttendanceDailyQuerySchema,
  staffAttendanceParamsSchema,
  staffAttendanceQuerySchema,
  upsertStaffAttendanceBatchSchema,
  upsertStaffAttendanceSchema,
} from "../validation/staff-attendance.validation";
import {
  createStaffExpenseSchema,
  expenseParamsSchema,
  ledgerQuerySchema,
  staffIdSchema,
  summaryQuerySchema,
  updateStaffExpenseSchema,
} from "../validation/staff.validation";
import {
  allocateStaffRoomSchema as allocateRoomSchema,
  createStaffRoomSchema as createRoomSchema,
  roomIdSchema as staffRoomIdSchema,
  staffRoomStaffIdSchema,
  transferStaffRoomSchema as transferRoomSchema,
  updateStaffRoomSchema as updateRoomSchema,
} from "../validation/staff-room.validation";

const router = Router();
const adminOnly = [UserRole.Admin];

router.get(
  "/attendance/daily",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffAttendanceDailyQuerySchema, "query"),
  staffController.getDailyAttendance,
);
router.put(
  "/attendance/daily",
  authenticate,
  authorize(adminOnly),
  validateRequest(upsertStaffAttendanceBatchSchema),
  staffController.upsertDailyAttendance,
);
router.get(
  "/me/attendance",
  authenticate,
  authorize([UserRole.Employee]),
  validateRequest(staffAttendanceQuerySchema, "query"),
  staffController.getMyMonthlyAttendance,
);
router.get(
  "/:staffId/attendance",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffAttendanceParamsSchema, "params"),
  validateRequest(staffAttendanceQuerySchema, "query"),
  staffController.getMonthlyAttendance,
);
router.put(
  "/:staffId/attendance",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffAttendanceParamsSchema, "params"),
  validateRequest(upsertStaffAttendanceSchema),
  staffController.upsertAttendance,
);

router.get(
  "/rooms",
  authenticate,
  authorize(adminOnly),
  staffController.getRooms,
);
router.post(
  "/rooms",
  authenticate,
  authorize(adminOnly),
  validateRequest(createRoomSchema),
  staffController.createRoom,
);
router.get(
  "/rooms/allocations/history",
  authenticate,
  authorize(adminOnly),
  staffController.getAllRoomAllocationHistory,
);
router.patch(
  "/rooms/:roomId",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffRoomIdSchema, "params"),
  validateRequest(updateRoomSchema),
  staffController.updateRoom,
);
router.delete(
  "/rooms/:roomId",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffRoomIdSchema, "params"),
  staffController.deleteRoom,
);
router.get(
  "/rooms/:roomId/allocations",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffRoomIdSchema, "params"),
  staffController.getRoomAllocationHistory,
);
router.post(
  "/rooms/:roomId/allocations",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffRoomIdSchema, "params"),
  validateRequest(allocateRoomSchema),
  staffController.allocateStaff,
);
router.get(
  "/:staffId/room-allocation/history",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffRoomStaffIdSchema, "params"),
  staffController.getStaffRoomHistory,
);
router.post(
  "/:staffId/room-allocation/transfer",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffRoomStaffIdSchema, "params"),
  validateRequest(transferRoomSchema),
  staffController.transferStaffRoom,
);
router.delete(
  "/:staffId/room-allocation",
  authenticate,
  authorize(adminOnly),
  validateRequest(staffRoomStaffIdSchema, "params"),
  staffController.vacateStaffRoom,
);

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
