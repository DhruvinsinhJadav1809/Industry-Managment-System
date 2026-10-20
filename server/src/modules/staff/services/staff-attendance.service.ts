import { Types } from "mongoose";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { ConflictError } from "../../../shared/errors/conflict.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import UserModel from "../../users/schemas/user.schema";
import {
  StaffAttendanceBatchItemDto,
  StaffAttendanceDailyQueryDto,
  StaffAttendancePeriodQueryDto,
  UpsertStaffAttendanceBatchDto,
  UpsertStaffAttendanceDto,
} from "../dto/staff-attendance.dto";
import {
  StaffAttendanceDailyDto,
  StaffAttendanceMonthDto,
  StaffAttendanceResponseDto,
} from "../dto/staff-attendance.response.dto";
import StaffAttendanceModel from "../schema/staff-attendance.schema";
import StaffAttendanceDayModel from "../schema/staff-attendance-day.schema";
import { IStaffAttendance } from "../types/staff-attendance.types";

type AttendanceRecord = IStaffAttendance & { _id: Types.ObjectId };

const validateStaff = async (staffId: string) => {
  const staff = await UserModel.findOne({
    _id: staffId,
    roleId: UserRole.Employee,
    isDeleted: false,
  });
  if (!staff) throw new NotFoundError("Staff user not found.");
};

const toResponse = (record: AttendanceRecord): StaffAttendanceResponseDto => ({
  id: record._id.toString(),
  staffId: record.staffId.toString(),
  date: record.date.toISOString().slice(0, 10),
  status: record.status,
  nightShift: record.nightShift,
  overtimeHours: record.overtimeHours,
});

const monthStart = (year: number, month: number) =>
  new Date(Date.UTC(year, month - 1, 1));

const nextMonthStart = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 1));

const normalizeDate = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

export const getDailyAttendance = async (
  query: StaffAttendanceDailyQueryDto,
): Promise<StaffAttendanceDailyDto> => {
  const date = normalizeDate(query.date);
  const [records, submission] = await Promise.all([
    StaffAttendanceModel.find({ date })
      .sort({ staffId: 1 })
      .lean<AttendanceRecord[]>(),
    StaffAttendanceDayModel.exists({ date }),
  ]);
  return { records: records.map(toResponse), submitted: Boolean(submission) };
};

export const upsertDailyAttendance = async (
  data: UpsertStaffAttendanceBatchDto,
  currentUserId: string,
): Promise<StaffAttendanceDailyDto> => {
  const staffIds = data.records.map((record) => record.staffId);
  const totalStaff = await UserModel.countDocuments({
    roleId: UserRole.Employee,
    isDeleted: false,
  });
  if (staffIds.length !== totalStaff)
    throw new ConflictError(
      "Daily submission must include every staff member.",
    );

  const validStaff = await UserModel.find({
    _id: { $in: staffIds },
    roleId: UserRole.Employee,
    isDeleted: false,
  })
    .select("_id")
    .lean<{ _id: Types.ObjectId }[]>();
  if (validStaff.length !== staffIds.length)
    throw new NotFoundError("One or more staff users were not found.");

  const date = normalizeDate(data.date);
  const existingCount = await StaffAttendanceModel.countDocuments({
    date,
    staffId: { $in: staffIds },
  });
  if (existingCount === staffIds.length)
    throw new ConflictError(
      "Daily attendance has already been saved for this date.",
    );

  let submissionDay;
  try {
    submissionDay = await StaffAttendanceDayModel.create({
      date,
      createdBy: new Types.ObjectId(currentUserId),
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new ConflictError(
        "Daily attendance has already been saved for this date.",
      );
    }
    throw error;
  }

  const updatedBy = new Types.ObjectId(currentUserId);
  try {
    await StaffAttendanceModel.bulkWrite(
      data.records.map((record: StaffAttendanceBatchItemDto) => ({
        updateOne: {
          filter: { staffId: new Types.ObjectId(record.staffId), date },
          update: {
            $set: {
              status: record.status,
              nightShift: record.nightShift || record.status === "NIGHT_SHIFT",
              overtimeHours: record.overtimeHours,
              updatedBy,
            },
            $setOnInsert: {
              staffId: new Types.ObjectId(record.staffId),
              date,
              createdBy: updatedBy,
            },
          },
          upsert: true,
        },
      })),
    );
  } catch (error) {
    await StaffAttendanceDayModel.deleteOne({ _id: submissionDay._id });
    throw error;
  }

  return getDailyAttendance({ date });
};

export const getMonthlyAttendance = async (
  staffId: string,
  query: StaffAttendancePeriodQueryDto,
): Promise<StaffAttendanceMonthDto> => {
  await validateStaff(staffId);
  const records = await StaffAttendanceModel.find({
    staffId,
    date: {
      $gte: monthStart(query.year, query.month),
      $lt: nextMonthStart(query.year, query.month),
    },
  })
    .sort({ date: 1 })
    .lean<AttendanceRecord[]>();

  const summary: StaffAttendanceMonthDto["summary"] = {
    month: query.month,
    year: query.year,
    presentDays: 0,
    absentDays: 0,
    halfDays: 0,
    attendanceDays: 0,
    weekOffs: 0,
    festivalLeaves: 0,
    nightShifts: 0,
    overtimeDays: 0,
    overtimeHours: 0,
  };

  for (const record of records) {
    switch (record.status) {
      case "PRESENT":
        summary.presentDays += 1;
        break;
      case "ABSENT":
        summary.absentDays += 1;
        break;
      case "HALF_DAY":
        summary.halfDays += 1;
        break;
      case "WEEK_OFF":
        summary.weekOffs += 1;
        break;
      case "FESTIVAL_LEAVE":
        summary.festivalLeaves += 1;
        break;
    }
    if (record.status === "NIGHT_SHIFT" || record.nightShift)
      summary.nightShifts += 1;
    if (record.status === "OVERTIME" || record.overtimeHours > 0)
      summary.overtimeDays += 1;
    summary.overtimeHours += record.overtimeHours;
  }

  summary.attendanceDays = summary.presentDays + summary.halfDays * 0.5;
  return { records: records.map(toResponse), summary };
};

export const upsertAttendance = async (
  staffId: string,
  data: UpsertStaffAttendanceDto,
  currentUserId: string,
): Promise<StaffAttendanceResponseDto> => {
  await validateStaff(staffId);
  const date = new Date(
    Date.UTC(
      data.date.getUTCFullYear(),
      data.date.getUTCMonth(),
      data.date.getUTCDate(),
    ),
  );
  const filter = { staffId, date };
  const update = {
    $set: {
      status: data.status,
      nightShift: data.nightShift,
      overtimeHours: data.overtimeHours,
      updatedBy: currentUserId,
    },
    $setOnInsert: { staffId, date, createdBy: currentUserId },
  };
  let record: AttendanceRecord | null;
  try {
    record = await StaffAttendanceModel.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }).lean<AttendanceRecord>();
  } catch (error) {
    if (
      !error ||
      typeof error !== "object" ||
      !("code" in error) ||
      error.code !== 11000
    ) {
      throw error;
    }
    record = await StaffAttendanceModel.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    }).lean<AttendanceRecord>();
  }

  if (!record) throw new NotFoundError("Attendance record could not be saved.");
  return toResponse(record);
};
