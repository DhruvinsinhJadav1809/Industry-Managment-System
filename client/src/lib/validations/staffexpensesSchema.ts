import { z } from "zod";

export const staffExpenseSchema = z.object({
  expenseType: z.enum(
    ["ADVANCE", "MEDICAL", "MEAL", "TRANSPORT", "MISC", "BONUS", "DEDUCTION"],
    {
      message: "Select an expense type",
    },
  ),
  amount: z.coerce
    .number({ message: "Enter a valid amount" })
    .positive("Amount must be greater than 0"),
  expenseDate: z.string().min(1, "Expense date is required"),
  note: z.string().max(300, "Note must be under 300 characters").optional(),
});

export type StaffExpenseFormValues = z.infer<typeof staffExpenseSchema>;
