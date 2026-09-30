import { z } from "zod";

export const expenseSchema = z.object({
  expenseType: z
    .string()
    .min(1, "Expense type is required")
    .max(60, "Expense type must be under 60 characters"),
  amount: z.coerce
    .number({ message: "Enter a valid amount" })
    .positive("Amount must be greater than 0"),
  expenseDate: z.string().min(1, "Expense date is required"),
  paymentType: z.string().min(1, "Select a payment type"),
  paidBy: z.string().min(1, "Select who paid"),
  referenceNumber: z
    .string()
    .max(60, "Reference number must be under 60 characters")
    .optional(),
  note: z.string().max(300, "Note must be under 300 characters").optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
