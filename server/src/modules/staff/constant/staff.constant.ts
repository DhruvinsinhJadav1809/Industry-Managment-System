export const StaffExpenseType = {
  ADVANCE: "ADVANCE",
  MEDICAL: "MEDICAL",
  MEAL: "MEAL",
  TRANSPORT: "TRANSPORT",
  MISC: "MISC",
  DEDUCTION: "DEDUCTION",
  BONUS: "BONUS",
} as const;

export type StaffExpenseTypeValue =
  (typeof StaffExpenseType)[keyof typeof StaffExpenseType];

export const STAFF_EXPENSE_TYPES = Object.values(StaffExpenseType);
