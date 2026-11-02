import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import {
  CreateStaffTaskDto,
  StaffTaskHistoryQueryDto,
  StaffTaskMonthlyReportQueryDto,
  UpdateStaffTaskDto,
} from "./staff-task.dto";
import * as staffTaskService from "./staff-task.service";

export const getTodayTasks = asyncHandler(async (req, res) => {
  const result = await staffTaskService.getTodayTasks(req.user.id, req.user.roleId);
  return res.json(successResponse(result, "Today's staff tasks retrieved."));
});

export const createTask = asyncHandler(async (req, res) => {
  const result = await staffTaskService.createTask(
    req.body as CreateStaffTaskDto,
    req.user.id,
  );
  return res
    .status(201)
    .json(successResponse(result, "Staff task assigned successfully."));
});

export const getHistory = asyncHandler(async (req, res) => {
  const result = await staffTaskService.getTaskHistory(
    res.locals.validated as StaffTaskHistoryQueryDto,
  );
  return res.json(successResponse(result, "Staff task history retrieved."));
});

export const getMonthlyWorkReport = asyncHandler(async (req, res) => {
  const query = res.locals.validated as StaffTaskMonthlyReportQueryDto;
  const result = await staffTaskService.getMonthlyWorkReport(
    query.month,
    req.user.id,
    req.user.roleId,
  );
  return res.json(successResponse(result, "Monthly staff work report retrieved."));
});

export const updateTask = asyncHandler(async (req, res) => {
  const result = await staffTaskService.updateTask(
    String(req.params.taskId),
    req.user.id,
    req.user.fullName,
    req.body as UpdateStaffTaskDto,
  );
  return res.json(successResponse(result, "Staff task updated successfully."));
});
