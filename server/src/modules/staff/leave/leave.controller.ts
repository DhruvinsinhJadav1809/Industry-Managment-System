import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import {
  CreateStaffLeaveRequestDto,
  ReviewStaffLeaveRequestDto,
  StaffLeaveHistoryQueryDto,
} from "./leave.dto";
import * as staffLeaveService from "./leave.service";

export const createLeaveRequest = asyncHandler(async (req, res) => {
  const request = await staffLeaveService.createLeaveRequest(
    req.body as CreateStaffLeaveRequestDto,
    req.user.id,
    req.user.fullName,
  );
  return res
    .status(201)
    .json(successResponse(request, "Leave request submitted successfully."));
});

export const getLeaveHistory = asyncHandler(async (req, res) => {
  const history = await staffLeaveService.getLeaveHistory(
    req.user.id,
    req.user.roleId,
    res.locals.validated as StaffLeaveHistoryQueryDto,
  );
  return res.json(successResponse(history, "Leave history retrieved."));
});

export const reviewLeaveRequest = asyncHandler(async (req, res) => {
  const request = await staffLeaveService.reviewLeaveRequest(
    String(req.params.leaveId),
    req.body as ReviewStaffLeaveRequestDto,
    req.user.id,
    req.user.fullName,
  );
  return res.json(
    successResponse(request, "Leave request updated successfully."),
  );
});
