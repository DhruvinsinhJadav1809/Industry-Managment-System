import { z } from "zod";
import { STAFF_ATTENDANCE_STATUSES } from "../constant/staff-attendance.constant";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";

const localDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use yyyy-mm-dd format.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Date is invalid.")
  .refine(
    (value) => value <= localDateString(new Date()),
    "Attendance cannot be marked for a future date.",
  )
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

const todayDateSchema = dateSchema.refine(
  (value) => value.toISOString().slice(0, 10) === localDateString(new Date()),
  "Daily team attendance can only be saved for today.",
);

const attendanceEntrySchema = z
  .object({
    staffId: objectIdSchema,
    status: z.enum(STAFF_ATTENDANCE_STATUSES),
    nightShift: z.boolean().default(false),
    overtimeHours: z.number().min(0).max(24).default(0),
  })
  .refine((value) => value.status !== "OVERTIME" || value.overtimeHours > 0, {
    message: "Overtime status requires overtime hours.",
    path: ["overtimeHours"],
  });

export const staffAttendanceParamsSchema = z.object({
  staffId: objectIdSchema,
});

export const staffAttendanceQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2200),
});

export const staffAttendanceDailyQuerySchema = z.object({
  date: todayDateSchema,
});

export const upsertStaffAttendanceBatchSchema = z
  .object({
    date: todayDateSchema,
    records: z.array(attendanceEntrySchema).min(1),
  })
  .refine(
    (value) =>
      new Set(value.records.map((record) => record.staffId)).size ===
      value.records.length,
    { message: "A staff member can only appear once in a daily submission." },
  );

export const upsertStaffAttendanceSchema = z
  .object({
    date: dateSchema,
    status: z.enum(STAFF_ATTENDANCE_STATUSES),
    nightShift: z.boolean().default(false),
    overtimeHours: z.number().min(0).max(24).default(0),
  })
  .refine((value) => value.status !== "OVERTIME" || value.overtimeHours > 0, {
    message: "Overtime status requires overtime hours.",
    path: ["overtimeHours"],
  })
  .transform((value) => ({
    ...value,
    nightShift: value.nightShift || value.status === "NIGHT_SHIFT",
  }));
