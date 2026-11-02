import { z } from "zod";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";
import { STAFF_LEAVE_TYPES } from "./leave.types";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use yyyy-mm-dd format.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Date is invalid.");

const localDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const createStaffLeaveRequestSchema = z
  .object({
    leaveType: z.enum(STAFF_LEAVE_TYPES),
    startDate: dateString,
    endDate: dateString,
    reason: z.string().trim().min(1, "A reason is required.").max(1000),
  })
  .superRefine((value, context) => {
    const today = localDateString(new Date());
    const currentMonth = today.slice(0, 7);

    if (
      value.startDate < today ||
      value.startDate.slice(0, 7) !== currentMonth
    ) {
      context.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Leave must start today or later in the current month.",
      });
    }
    if (
      value.endDate < today ||
      value.endDate.slice(0, 7) !== currentMonth
    ) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Leave must end within the current month.",
      });
    }
    if (value.startDate > value.endDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "The end date must be on or after the start date.",
      });
    }
    if (value.leaveType === "HALF_DAY" && value.startDate !== value.endDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Half-day leave must be requested for a single date.",
      });
    }
  });

export const staffLeaveRequestIdSchema = z.object({
  leaveId: objectIdSchema,
});

export const reviewStaffLeaveRequestSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    reason: z.string().trim().max(1000).optional(),
  })
  .superRefine((value, context) => {
    if (value.status === "REJECTED" && !value.reason?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "A reason is required when rejecting a leave request.",
      });
    }
  });

export const staffLeaveHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
