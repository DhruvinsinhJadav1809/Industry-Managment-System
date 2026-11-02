import { Types } from "mongoose";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { ForbiddenError } from "../../../shared/errors/forbidden.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { UserRole } from "../../../shared/enums/user-role.enum";
import UserModel from "../../users/schemas/user.schema";
import StaffAttendanceModel from "../schema/staff-attendance.schema";
import {
  CreateStaffTaskDto,
  StaffTaskHistoryQueryDto,
  StaffTaskMonthlyReportQueryDto,
  UpdateStaffTaskDto,
} from "./staff-task.dto";
import StaffTaskModel from "./staff-task.schema";
import {
  IStaffTask,
  StaffTaskDailyTotalsDto,
  StaffTaskDto,
  StaffTaskHistoryDto,
  StaffTaskMonthlyReportDto,
  StaffTaskShift,
  StaffTaskShiftSummaryDto,
  StaffTaskStaffSummaryDto,
  StaffTaskTodayDto,
} from "./staff-task.types";

type StaffTaskRecord = IStaffTask & { _id: Types.ObjectId };
type UserRecord = { _id: Types.ObjectId; fullName: string };

const isNonWorkingAttendance = (status: string) =>
  status === "ABSENT" || status === "WEEK_OFF" || status === "FESTIVAL_LEAVE";

const getToday = () => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
};

const dateString = (date: Date) => date.toISOString().slice(0, 10);

const emptyShiftSummary = (): StaffTaskShiftSummaryDto => ({
  assignedHours: 0,
  regularHours: 0,
  overtimeHours: 0,
  taskCount: 0,
});

const toResponse = (
  task: StaffTaskRecord,
  staffName: string,
): StaffTaskDto => ({
  id: task._id.toString(),
  staffId: task.staffId.toString(),
  staffName,
  title: task.title,
  description: task.description,
  assignedDate: dateString(task.assignedDate),
  shift: task.shift,
  priority: task.priority,
  estimatedHours: task.estimatedHours,
  overtimeHours: task.overtimeHours,
  status: task.status,
  comments: task.comments.map((comment) => ({
    authorId: comment.authorId.toString(),
    authorName: comment.authorName,
    message: comment.message,
    createdAt: comment.createdAt,
  })),
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const getStaffNames = async (staffIds: Types.ObjectId[]) => {
  const uniqueIds = [...new Set(staffIds.map((id) => id.toString()))];
  if (uniqueIds.length === 0) return new Map<string, string>();
  const staff = await UserModel.find({ _id: { $in: uniqueIds } })
    .select("_id fullName")
    .lean<UserRecord[]>();
  return new Map(staff.map((user) => [user._id.toString(), user.fullName]));
};

const getShiftAttendance = async (staffId: string, date: Date) =>
  StaffAttendanceModel.findOne({
    staffId: new Types.ObjectId(staffId),
    date,
  })
    .select("status nightShift overtimeHours")
    .lean<{ status: string; nightShift: boolean; overtimeHours: number }>();

const shiftCapacity = (
  attendance:
    | { status: string; nightShift: boolean; overtimeHours: number }
    | null
    | undefined,
  shift: StaffTaskShift,
) => {
  if (!attendance) return 0;
  if (isNonWorkingAttendance(attendance.status)) return 0;
  if (
    shift === "NIGHT" &&
    !attendance.nightShift &&
    attendance.status !== "NIGHT_SHIFT"
  ) {
    return 0;
  }
  const regularHours = attendance.status === "HALF_DAY" ? 4 : 7;
  return (
    regularHours +
    (attendance.status === "OVERTIME" ? attendance.overtimeHours : 0)
  );
};

function assertShiftAllowed(
  shift: StaffTaskShift,
  attendance:
    | { status: string; nightShift: boolean; overtimeHours: number }
    | null
    | undefined,
): asserts attendance is {
  status: string;
  nightShift: boolean;
  overtimeHours: number;
} {
  if (!attendance) {
    throw new BadRequestError(
      "Today's attendance must be marked before assigning tasks.",
    );
  }
  if (isNonWorkingAttendance(attendance.status)) {
    throw new BadRequestError(
      `Tasks cannot be assigned when attendance is marked ${attendance.status.replace("_", " ")}.`,
    );
  }
  if (
    shift === "NIGHT" &&
    !attendance?.nightShift &&
    attendance?.status !== "NIGHT_SHIFT"
  ) {
    throw new BadRequestError(
      "Night shift tasks require today's attendance to be marked as a night shift.",
    );
  }
}

const validateStaff = async (staffId: string) => {
  const staff = await UserModel.findOne({
    _id: staffId,
    roleId: UserRole.Employee,
    isActive: true,
    isDeleted: false,
  })
    .select("_id fullName")
    .lean<UserRecord>();
  if (!staff) throw new NotFoundError("Active staff user not found.");
  return staff;
};

const getShiftTotals = async (
  staffId: string,
  date: Date,
  shift: StaffTaskShift,
) => {
  const tasks = await StaffTaskModel.find({ staffId, assignedDate: date, shift })
    .select("estimatedHours overtimeHours")
    .lean<{ estimatedHours: number; overtimeHours: number }[]>();
  return {
    assignedHours: tasks.reduce((sum, task) => sum + task.estimatedHours, 0),
    overtimeHours: tasks.reduce((sum, task) => sum + task.overtimeHours, 0),
  };
};

export const createTask = async (
  data: CreateStaffTaskDto,
  currentUserId: string,
) => {
  const staff = await validateStaff(data.staffId);
  const today = getToday();
  const attendance = await getShiftAttendance(data.staffId, today);
  assertShiftAllowed(data.shift, attendance);

  const current = await getShiftTotals(data.staffId, today, data.shift);
  const assignedHours = current.assignedHours + data.estimatedHours;
  const maxHours = shiftCapacity(attendance, data.shift);
  if (assignedHours > maxHours) {
    throw new BadRequestError(
      attendance.status === "HALF_DAY"
        ? "Staff marked Half Day can be assigned at most 4 hours per shift."
        : `This shift can be assigned at most ${maxHours} hours based on today's attendance.`,
    );
  }
  const overtimeHours =
    Math.max(0, assignedHours - 7) -
    Math.max(0, current.assignedHours - 7);

  const task = await StaffTaskModel.create({
    ...data,
    assignedDate: today,
    overtimeHours,
    status: "PENDING",
    createdBy: new Types.ObjectId(currentUserId),
  });
  return toResponse(task.toObject() as StaffTaskRecord, staff.fullName);
};

const buildDailyTotals = (
  tasks: StaffTaskRecord[],
  staffSummaries: StaffTaskStaffSummaryDto[],
): StaffTaskDailyTotalsDto => ({
  taskCount: tasks.length,
  pendingCount: tasks.filter((task) => task.status === "PENDING").length,
  inProgressCount: tasks.filter((task) => task.status === "IN_PROGRESS").length,
  completedCount: tasks.filter((task) => task.status === "COMPLETED").length,
  assignedHours: tasks.reduce((sum, task) => sum + task.estimatedHours, 0),
  regularHours: staffSummaries.reduce(
    (sum, summary) =>
      sum + summary.dayShift.regularHours + summary.nightShift.regularHours,
    0,
  ),
  overtimeHours: staffSummaries.reduce(
    (sum, summary) =>
      sum + summary.dayShift.overtimeHours + summary.nightShift.overtimeHours,
    0,
  ),
});

export const getTodayTasks = async (
  currentUserId: string,
  roleId: UserRole,
): Promise<StaffTaskTodayDto> => {
  const today = getToday();
  const filter =
    roleId === UserRole.Admin
      ? { assignedDate: today }
      : { assignedDate: today, staffId: new Types.ObjectId(currentUserId) };
  const [tasks, staff, attendance] = await Promise.all([
    StaffTaskModel.find(filter)
      .sort({ createdAt: 1 })
      .lean<StaffTaskRecord[]>(),
    roleId === UserRole.Admin
      ? UserModel.find({
          roleId: UserRole.Employee,
          isActive: true,
          isDeleted: false,
        })
          .select("_id fullName")
          .sort({ fullName: 1 })
          .lean<UserRecord[]>()
      : UserModel.find({ _id: currentUserId })
          .select("_id fullName")
          .lean<UserRecord[]>(),
    StaffAttendanceModel.find({ date: today })
      .select("staffId status nightShift overtimeHours")
      .lean<
        {
          staffId: Types.ObjectId;
          status: string;
          nightShift: boolean;
          overtimeHours: number;
        }[]
      >(),
  ]);

  const names = await getStaffNames(tasks.map((task) => task.staffId));
  for (const user of staff) names.set(user._id.toString(), user.fullName);
  const attendanceByStaff = new Map(
    attendance.map((record) => [record.staffId.toString(), record]),
  );
  const tasksByStaff = new Map<string, StaffTaskRecord[]>();
  for (const task of tasks) {
    const staffId = task.staffId.toString();
    const group = tasksByStaff.get(staffId) ?? [];
    group.push(task);
    tasksByStaff.set(staffId, group);
  }

  const staffSummaries: StaffTaskStaffSummaryDto[] = staff.map((user) => {
    const staffId = user._id.toString();
    const records = tasksByStaff.get(staffId) ?? [];
    const dailyAttendance = attendanceByStaff.get(staffId);
    const dayShift = emptyShiftSummary();
    const nightShift = emptyShiftSummary();
    for (const task of records) {
      const shiftSummary =
        task.shift === "DAY" ? dayShift : nightShift;
      shiftSummary.assignedHours += task.estimatedHours;
      shiftSummary.overtimeHours += task.overtimeHours;
      shiftSummary.taskCount += 1;
    }
    const regularCapacity = isNonWorkingAttendance(
      dailyAttendance?.status ?? "",
    )
      ? 0
      : dailyAttendance?.status === "HALF_DAY"
        ? 4
        : dailyAttendance
          ? 7
          : 0;
    dayShift.regularHours = Math.min(dayShift.assignedHours, regularCapacity);
    nightShift.regularHours = Math.min(
      nightShift.assignedHours,
      shiftCapacity(dailyAttendance, "NIGHT") > 0 ? regularCapacity : 0,
    );
    const nightShiftEligible =
      Boolean(dailyAttendance?.nightShift) ||
      dailyAttendance?.status === "NIGHT_SHIFT";
    return {
      staffId,
      staffName: user.fullName,
      attendanceStatus: dailyAttendance?.status ?? null,
      attendanceMarked: Boolean(dailyAttendance),
      dayShift,
      nightShift,
      nightShiftEligible,
      overtimeAuthorized: dailyAttendance?.status === "OVERTIME",
      overtimeCapacityHours:
        dailyAttendance?.status === "OVERTIME"
          ? dailyAttendance.overtimeHours
          : 0,
      dayAvailableHours: Math.max(
        0,
        shiftCapacity(dailyAttendance, "DAY") - dayShift.assignedHours,
      ),
      nightAvailableHours: Math.max(
        0,
        shiftCapacity(dailyAttendance, "NIGHT") - nightShift.assignedHours,
      ),
    };
  });

  return {
    tasks: tasks.map((task) =>
      toResponse(
        task,
        names.get(task.staffId.toString()) ?? "Unknown staff",
      ),
    ),
    staffSummaries,
    totals: buildDailyTotals(tasks, staffSummaries),
  };
};

export const getTaskHistory = async (
  query: StaffTaskHistoryQueryDto,
): Promise<StaffTaskHistoryDto> => {
  const filter: Record<string, unknown> = {};
  if (query.from || query.to) {
    const assignedDate: Record<string, Date> = {};
    if (query.from) assignedDate.$gte = query.from;
    if (query.to) {
      const exclusiveEnd = new Date(query.to);
      exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
      assignedDate.$lt = exclusiveEnd;
    }
    filter.assignedDate = assignedDate;
  }
  if (query.staffId) filter.staffId = new Types.ObjectId(query.staffId);
  if (query.status) filter.status = query.status;
  const skip = (query.page - 1) * query.pageSize;
  const [tasks, total] = await Promise.all([
    StaffTaskModel.find(filter)
      .sort({ assignedDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(query.pageSize)
      .lean<StaffTaskRecord[]>(),
    StaffTaskModel.countDocuments(filter),
  ]);
  const names = await getStaffNames(tasks.map((task) => task.staffId));
  return {
    items: tasks.map((task) =>
      toResponse(task, names.get(task.staffId.toString()) ?? "Unknown staff"),
    ),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
};

export const getMonthlyWorkReport = async (
  month: StaffTaskMonthlyReportQueryDto["month"],
  currentUserId: string,
  roleId: UserRole,
): Promise<StaffTaskMonthlyReportDto> => {
  const [year, monthNumber] = month.split("-").map(Number);
  const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNumber, 1));
  const isAdmin = roleId === UserRole.Admin;
  const staffFilter = isAdmin
    ? {}
    : { staffId: new Types.ObjectId(currentUserId) };

  const [taskGroups, staff] = await Promise.all([
    StaffTaskModel.aggregate<{
      _id: { staffId: Types.ObjectId; date: Date };
      taskCount: number;
      completedTaskCount: number;
      completedHours: number;
      overtimeHours: number;
    }>([
      {
        $match: {
          ...staffFilter,
          assignedDate: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { staffId: "$staffId", date: "$assignedDate" },
          taskCount: { $sum: 1 },
          completedTaskCount: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
          completedHours: {
            $sum: {
              $cond: [
                { $eq: ["$status", "COMPLETED"] },
                "$estimatedHours",
                0,
              ],
            },
          },
          overtimeHours: {
            $sum: {
              $cond: [
                { $eq: ["$status", "COMPLETED"] },
                "$overtimeHours",
                0,
              ],
            },
          },
        },
      },
    ]),
    UserModel.find(
      isAdmin
        ? { roleId: UserRole.Employee, isDeleted: false }
        : {
            _id: currentUserId,
            roleId: UserRole.Employee,
            isDeleted: false,
          },
    )
      .select("_id fullName")
      .sort({ fullName: 1 })
      .lean<UserRecord[]>(),
  ]);

  if (!isAdmin && staff.length === 0) {
    throw new NotFoundError("Staff user not found.");
  }

  const staffIds = staff.map((user) => user._id);
  const attendance = await StaffAttendanceModel.find({
    staffId: { $in: staffIds },
    date: { $gte: startDate, $lt: endDate },
  })
    .select("staffId date status")
    .lean<{ staffId: Types.ObjectId; date: Date; status: string }[]>();
  const workDaysByStaff = new Map<
    string,
    Map<
      string,
      {
        date: string;
        attendanceStatus: string | null;
        completedHours: number;
        overtimeHours: number;
        taskCount: number;
        completedTaskCount: number;
      }
    >
  >();
  const getDay = (
    staffId: Types.ObjectId,
    date: Date,
  ) => {
    const staffKey = staffId.toString();
    const dateKey = dateString(date);
    let days = workDaysByStaff.get(staffKey);
    if (!days) {
      days = new Map();
      workDaysByStaff.set(staffKey, days);
    }
    let day = days.get(dateKey);
    if (!day) {
      day = {
        date: dateKey,
        attendanceStatus: null,
        completedHours: 0,
        overtimeHours: 0,
        taskCount: 0,
        completedTaskCount: 0,
      };
      days.set(dateKey, day);
    }
    return day;
  };

  for (const record of attendance) {
    getDay(record.staffId, record.date).attendanceStatus = record.status;
  }
  for (const group of taskGroups) {
    const day = getDay(group._id.staffId, group._id.date);
    day.taskCount = group.taskCount;
    day.completedTaskCount = group.completedTaskCount;
    day.completedHours = group.completedHours;
    day.overtimeHours = group.overtimeHours;
  }

  const eligibleAttendanceStatuses = new Set([
    "PRESENT",
    "NIGHT_SHIFT",
    "OVERTIME",
  ]);
  return {
    month,
    staff: staff.map((user) => {
      const days = [
        ...(workDaysByStaff.get(user._id.toString())?.values() ?? []),
      ].sort((first, second) => first.date.localeCompare(second.date));
      const completedHours = days.reduce(
        (total, day) => total + day.completedHours,
        0,
      );
      const overtimeHours = days.reduce(
        (total, day) => total + day.overtimeHours,
        0,
      );
      const eligibleWorkDays = days.filter(
        (day) =>
          day.attendanceStatus !== null &&
          eligibleAttendanceStatuses.has(day.attendanceStatus),
      );
      const eligibleWorkHours = eligibleWorkDays.reduce(
        (total, day) => total + day.completedHours,
        0,
      );
      return {
        staffId: user._id.toString(),
        staffName: user.fullName,
        completedHours,
        overtimeHours,
        eligibleWorkDays: eligibleWorkDays.length,
        averageCompletedHours:
          eligibleWorkDays.length > 0
            ? Math.round((eligibleWorkHours / eligibleWorkDays.length) * 100) /
              100
            : 0,
        days,
      };
    }),
  };
};

export const updateTask = async (
  taskId: string,
  currentUserId: string,
  currentUserName: string,
  data: UpdateStaffTaskDto,
) => {
  const today = getToday();
  const task = await StaffTaskModel.findOne({
    _id: taskId,
    staffId: currentUserId,
    assignedDate: today,
  });
  if (!task) {
    const ownTask = await StaffTaskModel.exists({
      _id: taskId,
      staffId: currentUserId,
    });
    if (ownTask)
      throw new BadRequestError("Only today's tasks can be updated.");
    const exists = await StaffTaskModel.exists({ _id: taskId });
    if (exists) throw new ForbiddenError("You can only update your own tasks.");
    throw new NotFoundError("Staff task not found.");
  }
  if (task.status === "COMPLETED") {
    throw new BadRequestError("Completed tasks cannot be changed.");
  }
  if (data.status !== undefined) task.status = data.status;
  if (data.comment !== undefined) {
    task.comments.push({
      authorId: new Types.ObjectId(currentUserId),
      authorName: currentUserName,
      message: data.comment,
      createdAt: new Date(),
    });
  }
  task.updatedBy = new Types.ObjectId(currentUserId);
  await task.save();
  const staff = await UserModel.findById(task.staffId)
    .select("fullName")
    .lean<{ fullName: string }>();
  if (!staff) throw new NotFoundError("Task staff member not found.");
  return toResponse(task.toObject() as StaffTaskRecord, staff.fullName);
};

export const validateAttendanceChangeAgainstTasks = async (
  staffId: string,
  date: Date,
  attendance: { status: string; nightShift: boolean; overtimeHours: number },
) => {
  const tasks = await StaffTaskModel.find({ staffId, assignedDate: date })
    .select("shift estimatedHours")
    .lean<{ shift: StaffTaskShift; estimatedHours: number }[]>();
  for (const shift of ["DAY", "NIGHT"] as const) {
    const assignedHours = tasks
      .filter((task) => task.shift === shift)
      .reduce((sum, task) => sum + task.estimatedHours, 0);
    const capacity = shiftCapacity(attendance, shift);
    if (assignedHours > capacity) {
      const shiftName = shift === "DAY" ? "Day" : "Night";
      const message =
        isNonWorkingAttendance(attendance.status)
          ? `Cannot mark ${attendance.status.replace("_", " ")} while the ${shiftName} shift has ${assignedHours} assigned hours.`
          : capacity === 0
          ? `${shiftName} shift has ${assignedHours} assigned hours. Keep attendance marked for this shift before changing it.`
          : attendance.status === "HALF_DAY"
            ? `Cannot mark Half Day: ${shiftName} shift already has ${assignedHours} assigned hours; Half Day allows up to 4 hours.`
            : `Cannot save attendance: ${shiftName} shift has ${assignedHours} assigned hours, exceeding the new ${capacity}-hour limit.`;
      throw new BadRequestError(message);
    }
  }
};
