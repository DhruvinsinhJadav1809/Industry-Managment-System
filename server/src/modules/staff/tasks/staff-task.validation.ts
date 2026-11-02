import { z } from "zod";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";
import {
  STAFF_TASK_PRIORITIES,
  STAFF_TASK_SHIFTS,
  STAFF_TASK_STATUSES,
} from "./staff-task.types";

const localDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const validDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use yyyy-mm-dd format.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Date is invalid.");

const todayDateString = validDateString.refine(
  (value) => value === localDateString(new Date()),
  "Tasks can only be assigned for today.",
);

const historyDateString = validDateString.transform(
  (value) => new Date(`${value}T00:00:00.000Z`),
);

export const createStaffTaskSchema = z.object({
  staffId: objectIdSchema,
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(4000),
  assignedDate: todayDateString,
  shift: z.enum(STAFF_TASK_SHIFTS),
  priority: z.enum(STAFF_TASK_PRIORITIES),
  estimatedHours: z.number().min(0.25).max(24),
});

export const staffTaskStatusParamsSchema = z.object({
  taskId: objectIdSchema,
});

export const updateStaffTaskSchema = z
  .object({
    status: z.enum(STAFF_TASK_STATUSES).optional(),
    comment: z.string().trim().min(1).max(2000).optional(),
  })
  .refine((value) => value.status !== undefined || value.comment !== undefined, {
    message: "Provide a task status or progress comment.",
  });

export const staffTaskHistoryQuerySchema = z
  .object({
    from: historyDateString.optional(),
    to: historyDateString.optional(),
    staffId: objectIdSchema.optional(),
    status: z.enum(STAFF_TASK_STATUSES).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
  })
  .refine(
    (value) =>
      value.from === undefined ||
      value.to === undefined ||
      value.from <= value.to,
    { message: "The start date must be on or before the end date." },
  );

export const staffTaskMonthlyReportQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must use yyyy-mm format."),
});
