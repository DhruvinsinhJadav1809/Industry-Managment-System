import { Types } from "mongoose";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { ConflictError } from "../../../shared/errors/conflict.error";
import { ForbiddenError } from "../../../shared/errors/forbidden.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { UserRole } from "../../../shared/enums/user-role.enum";
import UserModel from "../../users/schemas/user.schema";
import {
  CreateStaffLeaveRequestDto,
  ReviewStaffLeaveRequestDto,
  StaffLeaveHistoryQueryDto,
} from "./leave.dto";
import StaffLeaveRequestModel from "./leave.schema";
import {
  IStaffLeaveRequest,
  StaffLeaveHistoryDto,
  StaffLeaveRequestDto,
} from "./leave.types";

type StaffLeaveRequestRecord = IStaffLeaveRequest & { _id: Types.ObjectId };

const toResponse = (
  request: StaffLeaveRequestRecord,
): StaffLeaveRequestDto => ({
  id: request._id.toString(),
  staffId: request.staffId.toString(),
  staffName: request.staffName,
  leaveType: request.leaveType ?? "FULL_DAY",
  startDate: request.startDate.toISOString().slice(0, 10),
  endDate: request.endDate.toISOString().slice(0, 10),
  reason: request.reason,
  status: request.status,
  reviewReason: request.reviewReason ?? null,
  reviewedByName: request.reviewedByName,
  reviewedAt: request.reviewedAt,
  createdAt: request.createdAt,
});

const toDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

export const createLeaveRequest = async (
  data: CreateStaffLeaveRequestDto,
  staffId: string,
  staffName: string,
) => {
  if (data.startDate > data.endDate) {
    throw new BadRequestError("The end date must be on or after the start date.");
  }

  const staff = await UserModel.findOne({
    _id: staffId,
    roleId: UserRole.Employee,
    isActive: true,
    isDeleted: false,
  })
    .select("_id")
    .lean();
  if (!staff) throw new NotFoundError("Active employee not found.");

  const request = await StaffLeaveRequestModel.create({
    staffId: new Types.ObjectId(staffId),
    staffName,
    leaveType: data.leaveType,
    startDate: toDate(data.startDate),
    endDate: toDate(data.endDate),
    reason: data.reason,
  });
  return toResponse(request.toObject() as StaffLeaveRequestRecord);
};

export const getLeaveHistory = async (
  userId: string,
  roleId: number,
  query: StaffLeaveHistoryQueryDto,
): Promise<StaffLeaveHistoryDto> => {
  if (roleId !== UserRole.Admin && roleId !== UserRole.Employee) {
    throw new ForbiddenError("You cannot view leave requests.");
  }

  const filter =
    roleId === UserRole.Employee
      ? { staffId: new Types.ObjectId(userId) }
      : {};
  const [requests, total] = await Promise.all([
    StaffLeaveRequestModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.pageSize)
      .limit(query.pageSize)
      .lean<StaffLeaveRequestRecord[]>(),
    StaffLeaveRequestModel.countDocuments(filter),
  ]);

  return {
    items: requests.map(toResponse),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
};

export const reviewLeaveRequest = async (
  leaveId: string,
  data: ReviewStaffLeaveRequestDto,
  reviewerId: string,
  reviewerName: string,
) => {
  const request = await StaffLeaveRequestModel.findOneAndUpdate(
    { _id: leaveId, status: "PENDING" },
    {
      $set: {
        status: data.status,
        reviewReason: data.status === "REJECTED" ? data.reason?.trim() : null,
        reviewedBy: new Types.ObjectId(reviewerId),
        reviewedByName: reviewerName,
        reviewedAt: new Date(),
      },
    },
    { new: true, runValidators: true },
  ).lean<StaffLeaveRequestRecord | null>();

  if (request) return toResponse(request);

  const exists = await StaffLeaveRequestModel.exists({ _id: leaveId });
  if (!exists) throw new NotFoundError("Leave request not found.");
  throw new ConflictError("This leave request has already been reviewed.");
};
