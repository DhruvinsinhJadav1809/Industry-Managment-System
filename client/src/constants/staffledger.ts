import type { StaffExpenseType } from "../types/staff";

export const STAFF_EXPENSE_TYPE_OPTIONS: {
  value: StaffExpenseType;
  label: string;
}[] = [
  { value: "ADVANCE", label: "Advance" },
  { value: "MEDICAL", label: "Medical" },
  { value: "MEAL", label: "Meal" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "MISC", label: "Miscellaneous" },
  { value: "BONUS", label: "Bonus" },
  { value: "DEDUCTION", label: "Deduction" },
];

export const STAFF_EXPENSE_TYPE_LABELS: Record<StaffExpenseType, string> =
  STAFF_EXPENSE_TYPE_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.value]: opt.label }),
    {} as Record<StaffExpenseType, string>,
  );

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** 1-indexed (1 = January .. 12 = December), matching the API's month values. */
export const MONTH_OPTIONS = MONTH_NAMES.map((label, i) => ({
  value: i + 1,
  label,
}));

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}

export function monthNameShort(month: number): string {
  return monthName(month).slice(0, 3);
}
