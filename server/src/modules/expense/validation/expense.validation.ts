import { z } from "zod";
import {
  EXPENSE_TYPE_OPTIONS,
  ExpensePaymentType,
} from "../constant/expense.constant";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => value ?? null);

const expenseTypeValues = EXPENSE_TYPE_OPTIONS.map(
  (option) => option.value,
) as [
  (typeof EXPENSE_TYPE_OPTIONS)[number]["value"],
  ...(typeof EXPENSE_TYPE_OPTIONS)[number]["value"][],
];

const expenseTypeSchema = z.enum(expenseTypeValues);

export const createExpenseSchema = z.object({
  expenseType: expenseTypeSchema,
  amount: z.number().positive(),
  expenseDate: z.coerce.date(),
  paymentType: z.enum(ExpensePaymentType),
  paidBy: objectIdSchema,
  referenceNumber: optionalText(100),
  note: optionalText(500),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseIdSchema = z.object({ id: objectIdSchema });

export const expenseFilterSchema = z.object({
  month: z
    .string()
    .trim()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must use YYYY-MM format."),
  expenseType: expenseTypeSchema.optional(),
});
