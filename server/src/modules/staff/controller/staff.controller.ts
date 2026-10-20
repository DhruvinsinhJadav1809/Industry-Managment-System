import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import {
  CreateStaffExpenseDto,
  StaffLedgerQueryDto,
  StaffPeriodQueryDto,
  UpdateStaffExpenseDto,
} from "../dto/staff.dto";
import {
  StaffAttendanceDailyQueryDto,
  StaffAttendancePeriodQueryDto,
  UpsertStaffAttendanceBatchDto,
  UpsertStaffAttendanceDto,
} from "../dto/staff-attendance.dto";
import * as staffService from "../services/staff.service";
import * as staffAttendanceService from "../services/staff-attendance.service";
import * as staffRoomService from "../services/staff-room.service";
import {
  AllocateStaffRoomDto,
  CreateStaffRoomDto,
  TransferStaffRoomDto,
  UpdateStaffRoomDto,
} from "../dto/staff-room.dto";

export const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const attendance = await staffAttendanceService.getMonthlyAttendance(
    String(req.params.staffId),
    res.locals.validated as StaffAttendancePeriodQueryDto,
  );
  return res.json(
    successResponse(attendance, "Staff attendance retrieved successfully."),
  );
});

export const getMyMonthlyAttendance = asyncHandler(async (req, res) => {
  const attendance = await staffAttendanceService.getMonthlyAttendance(
    req.user.id,
    res.locals.validated as StaffAttendancePeriodQueryDto,
  );
  return res.json(
    successResponse(attendance, "Your attendance retrieved successfully."),
  );
});

export const getDailyAttendance = asyncHandler(async (req, res) => {
  const attendance = await staffAttendanceService.getDailyAttendance(
    res.locals.validated as StaffAttendanceDailyQueryDto,
  );
  return res.json(
    successResponse(
      attendance,
      "Daily staff attendance retrieved successfully.",
    ),
  );
});

export const upsertDailyAttendance = asyncHandler(async (req, res) => {
  const attendance = await staffAttendanceService.upsertDailyAttendance(
    req.body as UpsertStaffAttendanceBatchDto,
    req.user.id,
  );
  return res.json(
    successResponse(attendance, "Daily staff attendance saved successfully."),
  );
});

export const upsertAttendance = asyncHandler(async (req, res) => {
  const attendance = await staffAttendanceService.upsertAttendance(
    String(req.params.staffId),
    req.body as UpsertStaffAttendanceDto,
    req.user.id,
  );
  return res.json(
    successResponse(attendance, "Staff attendance saved successfully."),
  );
});

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

export const getRooms = asyncHandler(async (_req, res) => {
  const rooms = await staffRoomService.getRooms();
  return res.json(
    successResponse(rooms, "Staff rooms retrieved successfully."),
  );
});

export const createRoom = asyncHandler(async (req, res) => {
  const room = await staffRoomService.createRoom(
    req.body as CreateStaffRoomDto,
    req.user.id,
  );
  return res
    .status(201)
    .json(successResponse(room, "Staff room created successfully."));
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await staffRoomService.updateRoom(
    String(req.params.roomId),
    req.body as UpdateStaffRoomDto,
    req.user.id,
  );
  return res.json(successResponse(room, "Staff room updated successfully."));
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await staffRoomService.deleteRoom(
    String(req.params.roomId),
    req.user.id,
  );
  return res.json(successResponse(room, "Staff room deleted successfully."));
});

export const getRoomAllocationHistory = asyncHandler(async (req, res) => {
  const allocations = await staffRoomService.getRoomAllocationHistory(
    String(req.params.roomId),
  );
  return res.json(
    successResponse(
      allocations,
      "Room allocation history retrieved successfully.",
    ),
  );
});

export const getAllRoomAllocationHistory = asyncHandler(async (_req, res) => {
  const allocations = await staffRoomService.getAllRoomAllocationHistory();
  return res.json(
    successResponse(
      allocations,
      "All room allocation history retrieved successfully.",
    ),
  );
});

export const allocateStaff = asyncHandler(async (req, res) => {
  const result = await staffRoomService.allocateStaff(
    String(req.params.roomId),
    req.body as AllocateStaffRoomDto,
    req.user.id,
  );
  return res
    .status(201)
    .json(successResponse(result, "Staff allocated to room successfully."));
});

export const transferStaffRoom = asyncHandler(async (req, res) => {
  const result = await staffRoomService.transferStaff(
    String(req.params.staffId),
    req.body as TransferStaffRoomDto,
    req.user.id,
  );
  return res.json(successResponse(result, "Staff transferred successfully."));
});

export const vacateStaffRoom = asyncHandler(async (req, res) => {
  const result = await staffRoomService.vacateStaffRoom(
    String(req.params.staffId),
    req.user.id,
  );
  return res.json(
    successResponse(result, "Staff room allocation ended successfully."),
  );
});

export const getStaffRoomHistory = asyncHandler(async (req, res) => {
  const result = await staffRoomService.getStaffRoomHistory(
    String(req.params.staffId),
  );
  return res.json(
    successResponse(result, "Staff room history retrieved successfully."),
  );
});
