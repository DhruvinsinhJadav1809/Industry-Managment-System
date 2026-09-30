import { z } from "zod";
import { STAFF_EXPENSE_TYPES } from "../constant/staff.constant";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";

const expenseTypeSchema = z.enum(STAFF_EXPENSE_TYPES as [string, ...string[]]);
const noteSchema = z
  .string()
  .trim()
  .max(500)
  .nullable()
  .optional()
  .transform((value) => value ?? null);

export const staffIdSchema = z.object({ staffId: objectIdSchema });
export const expenseParamsSchema = z.object({
  staffId: objectIdSchema,
  expenseId: objectIdSchema,
});

export const createStaffExpenseSchema = z.object({
  expenseType: expenseTypeSchema,
  amount: z.number().positive(),
  expenseDate: z.coerce.date(),
  note: noteSchema,
});

export const updateStaffExpenseSchema = createStaffExpenseSchema.partial();
export const summaryQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2200),
});
export const ledgerQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2200),
});
