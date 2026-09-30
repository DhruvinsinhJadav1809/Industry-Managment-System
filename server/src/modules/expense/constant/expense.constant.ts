export const ExpensePaymentType = {
  CASH: "CASH",
  CHEQUE: "CHEQUE",
  ONLINE: "ONLINE",
  CARD: "CARD",
} as const;

export type ExpensePaymentTypeValue =
  (typeof ExpensePaymentType)[keyof typeof ExpensePaymentType];

export const EXPENSE_TYPE_OPTIONS = [
  { value: "Electricity", label: "Electricity" },
  { value: "Rent", label: "Rent" },
  { value: "Transport", label: "Transport" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Salary", label: "Salary" },
  { value: "Office", label: "Office" },
  { value: "Packaging", label: "Packaging" },
  { value: "Miscellaneous", label: "Miscellaneous" },
] as const;

export type ExpenseTypeValue = (typeof EXPENSE_TYPE_OPTIONS)[number]["value"];
