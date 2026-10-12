import { ArrowLeft, CalendarDays, Download, Plus, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Alert, Button, Select } from "../components/common";
import { StaffExpenseModal } from "../components/staff/StaffExpenseModal";
import {
  MONTH_OPTIONS,
  STAFF_EXPENSE_TYPE_LABELS,
  monthName,
  monthNameShort,
} from "../constants/staffledger";
import { useToast } from "../context/ToastContext";
import type { ApiErrorShape } from "../lib/axios";
import { AppLayout } from "../layouts/AppLayout";
import { staffService } from "../services/staffservice";
import { userService } from "../services/userService";
import type {
  StaffExpense,
  StaffExpenseType,
  StaffLedgerRow,
  StaffSalarySummary,
} from "../types/staff";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
const DEFAULT_YEAR = new Date().getFullYear();
const DEFAULT_MONTH = new Date().getMonth() + 1;
const EXPENSE_TYPE_COLORS: Record<StaffExpenseType, string> = {
  DEDUCTION: "#F87171",
  ADVANCE: "#3B82F6",
  MEDICAL: "#10B981",
  MEAL: "#F59E0B",
  TRANSPORT: "#8B5CF6",
  MISC: "#06B6D4",
  BONUS: "#A3A3A3",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    signDisplay: "never",
  }).format(Math.abs(value));
}

function currencyTone(value: number) {
  if (value > 0) return "text-emerald-600 dark:text-emerald-400";
  if (value < 0) return "text-red-600 dark:text-red-400";
  return "text-steel-900 dark:text-steel-50";
}

function formatExpenseDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export default function StaffSalary() {
  const { staffId } = useParams<{ staffId: string }>();
  const toast = useToast();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(DEFAULT_MONTH);
  const [staffName, setStaffName] = useState("Staff member");
  const [summary, setSummary] = useState<StaffSalarySummary | null>(null);
  const [ledger, setLedger] = useState<StaffLedgerRow[]>([]);
  const [expenses, setExpenses] = useState<StaffExpense[]>([]);
  const [editingExpense, setEditingExpense] = useState<StaffExpense | null>(
    null,
  );
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [expensesError, setExpensesError] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const totalDeductions = expenses.reduce(
    (total, expense) =>
      expense.expenseType === "DEDUCTION" ? total + expense.amount : total,
    0,
  );

  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, index) => DEFAULT_YEAR - 2 + index),
    [],
  );

  useEffect(() => {
    if (!staffId) return;

    const loadStaffName = async () => {
      try {
        const response = await userService.getById(staffId);
        setStaffName(response.data.fullName || "Staff member");
      } catch {
        setStaffName("Staff member");
      }
    };

    void loadStaffName();
  }, [staffId]);

  const loadSummary = async () => {
    if (!staffId) return;

    setIsLoadingSummary(true);
    setSummaryError(null);

    try {
      const response = await staffService.getStaffSalarySummary(
        staffId,
        selectedMonth,
        selectedYear,
      );
      setSummary(response.data);
    } catch (error) {
      setSummaryError((error as ApiErrorShape).message);
      setSummary(null);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const loadLedger = async () => {
    if (!staffId) return;

    setIsLoadingLedger(true);
    setLedgerError(null);

    try {
      const response = await staffService.getStaffLedger(staffId, selectedYear);
      setLedger(response.data ?? []);
    } catch (error) {
      setLedgerError((error as ApiErrorShape).message);
      setLedger([]);
    } finally {
      setIsLoadingLedger(false);
    }
  };

  const loadExpenses = async () => {
    if (!staffId) return;

    setIsLoadingExpenses(true);
    setExpensesError(null);

    try {
      const response = await staffService.getStaffExpenses(staffId, {
        month: selectedMonth,
        year: selectedYear,
      });

      const rawExpenses = Array.isArray(response.data) ? response.data : [];
      const filtered = rawExpenses.filter((expense) => {
        const expenseDate = new Date(expense.expenseDate);
        if (Number.isNaN(expenseDate.getTime())) return false;

        return (
          expenseDate.getFullYear() === selectedYear &&
          expenseDate.getMonth() + 1 === selectedMonth
        );
      });

      setExpenses(filtered);
    } catch (error) {
      setExpensesError((error as ApiErrorShape).message);
      setExpenses([]);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  useEffect(() => {
    if (!staffId) return;
    void loadSummary();
  }, [staffId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!staffId) return;
    void loadLedger();
  }, [staffId, selectedYear]);

  useEffect(() => {
    if (!staffId) return;
    void loadExpenses();
  }, [staffId, selectedMonth, selectedYear]);

  const expenseBreakdown = summary
    ? [
        { label: "Advance", value: summary.totalAdvances },
        { label: "Medical", value: summary.totalMedical },
        { label: "Meal", value: summary.totalMeal },
        { label: "Transport", value: summary.totalTransport },
        { label: "Miscellaneous", value: summary.totalMiscellaneous },
        { label: "Bonus", value: summary.totalBonus ?? 0 },
        {
          label: "Deduction",
          value: summary.totalDeductions ?? totalDeductions,
        },
      ]
    : [];

  const yearlyExpenseChartData = useMemo(
    () =>
      MONTH_OPTIONS.map((month) => ({
        month: monthNameShort(month.value),
        total:
          ledger.find((row) => row.month === month.value)?.totalExpenses ?? 0,
      })),
    [ledger],
  );

  const expenseCategoryChartData = useMemo(() => {
    const totals = new Map<StaffExpenseType, number>();
    expenses.forEach((expense) => {
      totals.set(
        expense.expenseType,
        (totals.get(expense.expenseType) ?? 0) + expense.amount,
      );
    });

    return Array.from(totals, ([type, value]) => ({
      type,
      name: STAFF_EXPENSE_TYPE_LABELS[type],
      value,
    })).filter((item) => item.value > 0);
  }, [expenses]);

  const totalCategoryExpenses = expenseCategoryChartData.reduce(
    (total, item) => total + item.value,
    0,
  );

  const handleExpenseSaved = async () => {
    const wasEditing = Boolean(editingExpense);
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
    await Promise.all([loadSummary(), loadLedger(), loadExpenses()]);
    toast.success(
      wasEditing
        ? "Expense updated successfully."
        : "Expense added successfully.",
    );
  };

  //Excel download

  const downloadYearlyLedger = async () => {
    if (!ledger.length) {
      return;
    }

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Yearly Ledger");

    // --------------------------------------------------
    // Report title
    // --------------------------------------------------

    worksheet.mergeCells("A1:L1");

    const titleCell = worksheet.getCell("A1");

    titleCell.value = "YEARLY STAFF LEDGER";

    titleCell.font = {
      bold: true,
      size: 18,
    };

    titleCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.getRow(1).height = 30;

    // --------------------------------------------------
    // Year
    // --------------------------------------------------

    worksheet.mergeCells("A2:L2");

    const yearCell = worksheet.getCell("A2");

    yearCell.value = `${staffName} - Year: ${selectedYear}`;

    yearCell.font = {
      bold: true,
      size: 12,
    };

    yearCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.getRow(2).height = 22;

    // Empty row
    worksheet.getRow(3).height = 8;

    // --------------------------------------------------
    // Headers
    // --------------------------------------------------

    const headers = [
      "Month",
      "Salary",
      "Advance",
      "Medical",
      "Meal",
      "Transport",
      "Misc",
      "Bonus",
      "Deduction",
      "Expenses",
      "Carry Forward",
      "Payable",
    ];

    const headerRow = worksheet.getRow(4);

    headerRow.values = headers;

    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        size: 11,
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FFD9E1F2",
        },
      };

      cell.border = {
        top: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      };
    });

    // --------------------------------------------------
    // Ledger rows
    // --------------------------------------------------

    ledger.forEach((row) => {
      const excelRow = worksheet.addRow([
        monthName(row.month),
        row.salary,
        row.totalAdvances,
        row.totalMedical,
        row.totalMeal,
        row.totalTransport,
        row.totalMiscellaneous,
        row.totalBonus ?? 0,
        row.totalDeductions ?? 0,
        row.totalExpenses,
        row.openingCarryForward,
        row.amountPayable,
      ]);

      excelRow.eachCell((cell, columnNumber) => {
        cell.border = {
          top: {
            style: "thin",
          },
          bottom: {
            style: "thin",
          },
          left: {
            style: "thin",
          },
          right: {
            style: "thin",
          },
        };

        cell.alignment = {
          // vertical: "center",
          horizontal: columnNumber === 1 ? "left" : "right",
        };
      });

      // Currency formatting
      for (let column = 2; column <= 12; column++) {
        excelRow.getCell(column).numFmt = "₹#,##0.00;[Red]-₹#,##0.00";
      }

      // Highlight selected month
      if (row.month === selectedMonth) {
        excelRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: "FFFFF2CC",
            },
          };

          cell.font = {
            bold: true,
          };
        });
      }

      // Payable emphasis
      excelRow.getCell(12).font = {
        bold: true,
      };
    });

    // --------------------------------------------------
    // Total row
    // --------------------------------------------------

    const totalRow = worksheet.addRow([
      "TOTAL",
      ledger.reduce((sum, row) => sum + row.salary, 0),
      ledger.reduce((sum, row) => sum + row.totalAdvances, 0),
      ledger.reduce((sum, row) => sum + row.totalMedical, 0),
      ledger.reduce((sum, row) => sum + row.totalMeal, 0),
      ledger.reduce((sum, row) => sum + row.totalTransport, 0),
      ledger.reduce((sum, row) => sum + row.totalMiscellaneous, 0),
      ledger.reduce((sum, row) => sum + (row.totalBonus ?? 0), 0),
      ledger.reduce((sum, row) => sum + row.totalExpenses, 0),
      ledger.reduce((sum, row) => sum + (row.totalDeductions ?? 0), 0),
      ledger.reduce((sum, row) => sum + row.openingCarryForward, 0),
      ledger.reduce((sum, row) => sum + row.amountPayable, 0),
    ]);

    totalRow.height = 25;

    totalRow.eachCell((cell, columnNumber) => {
      cell.font = {
        bold: true,
        size: 11,
      };

      cell.alignment = {
        // vertical: "center",
        horizontal: columnNumber === 1 ? "left" : "right",
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FFE2F0D9",
        },
      };

      cell.border = {
        top: {
          style: "medium",
        },
        bottom: {
          style: "medium",
        },
        left: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      };

      if (columnNumber >= 2) {
        cell.numFmt = "₹#,##0.00;[Red]-₹#,##0.00";
      }
    });

    // --------------------------------------------------
    // Column widths
    // --------------------------------------------------

    const columnWidths = [
      16, // Month
      15, // Salary
      15, // Advance
      15, // Medical
      15, // Meal
      15, // Transport
      15, // Misc
      15, // Bonus
      15, // Expenses
      15, // Deduction
      18, // Carry Forward
      18, // Payable
    ];

    worksheet.columns.forEach((column, index) => {
      column.width = columnWidths[index];
    });

    // --------------------------------------------------
    // Freeze header
    // --------------------------------------------------

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 4,
      },
    ];

    // --------------------------------------------------
    // Auto filter
    // --------------------------------------------------

    worksheet.autoFilter = {
      from: "A4",
      to: "L4",
    };

    // --------------------------------------------------
    // Generate Excel
    // --------------------------------------------------

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `staff-yearly-ledger-${selectedYear}.xlsx`);
  };
  return (
    <AppLayout>
      <button
        type="button"
        onClick={() => navigate("/staff")}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-steel-500 hover:text-steel-800 dark:text-steel-400 dark:hover:text-amber-400"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Staff List
      </button>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-steel-200 bg-white p-5 shadow-sm dark:border-steel-800 dark:bg-steel-900/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
              <Wallet className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
                Staff Salary & Expense
              </p>
              <h1 className="font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
                {staffName}
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Select
              label="Year"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              options={yearOptions.map((year) => ({
                value: year,
                label: String(year),
              }))}
            />
            <Select
              label="Month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
              options={MONTH_OPTIONS.map((month) => ({
                value: month.value,
                label: month.label,
              }))}
            />
          </div>
        </div>

        {summaryError && <Alert variant="error">{summaryError}</Alert>}
        {ledgerError && <Alert variant="error">{ledgerError}</Alert>}
        {expensesError && <Alert variant="error">{expensesError}</Alert>}

        <div className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-steel-500 dark:text-steel-400">
              <CalendarDays className="size-4" aria-hidden="true" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                {monthName(selectedMonth)} {selectedYear}
              </span>
            </div>

            <Button
              type="button"
              variant="primary"
              icon={<Plus className="size-4" aria-hidden="true" />}
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
            >
              Add Expense
            </Button>
          </div>

          <div className="rounded-xl border border-steel-200 bg-steel-50/80 p-5 text-center dark:border-steel-800 dark:bg-steel-950/60">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel-500 dark:text-steel-400">
              Amount Payable
            </p>
            <p
              className={`mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl ${
                isLoadingSummary || !summary
                  ? "text-steel-900 dark:text-steel-50"
                  : currencyTone(summary.amountPayable)
              }`}
              aria-live="polite"
            >
              {isLoadingSummary
                ? "—"
                : summary
                  ? formatCurrency(summary.amountPayable)
                  : "—"}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-steel-200 bg-steel-50/80 p-4 dark:border-steel-800 dark:bg-steel-950/60">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
                Monthly Salary
              </p>
              <p
                className={`mt-2 text-xl font-semibold ${
                  isLoadingSummary || !summary
                    ? "text-steel-900 dark:text-steel-50"
                    : currencyTone(summary.salary)
                }`}
              >
                {isLoadingSummary
                  ? "—"
                  : summary
                    ? formatCurrency(summary.salary)
                    : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-steel-200 bg-steel-50/80 p-4 dark:border-steel-800 dark:bg-steel-950/60">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
                Opening Carry Forward
              </p>
              <p
                className={`mt-2 text-xl font-semibold ${
                  isLoadingSummary || !summary
                    ? "text-steel-900 dark:text-steel-50"
                    : currencyTone(summary.openingCarryForward)
                }`}
              >
                {isLoadingSummary
                  ? "—"
                  : summary
                    ? formatCurrency(summary.openingCarryForward)
                    : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-steel-200 bg-steel-50/80 p-4 dark:border-steel-800 dark:bg-steel-950/60">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
                Total Expenses
              </p>
              <p
                className={`mt-2 text-xl font-semibold ${
                  isLoadingSummary || !summary
                    ? "text-steel-900 dark:text-steel-50"
                    : currencyTone(summary.totalExpenses)
                }`}
              >
                {isLoadingSummary
                  ? "—"
                  : summary
                    ? formatCurrency(summary.totalExpenses)
                    : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
          <h2 className="mb-4 font-display text-xl font-bold text-steel-900 dark:text-steel-50">
            Expense Breakdown
          </h2>

          <div className="space-y-3">
            {expenseBreakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-steel-200 bg-steel-50/80 px-4 py-3 dark:border-steel-800 dark:bg-steel-950/60"
              >
                <span className="font-medium text-steel-700 dark:text-steel-200">
                  {item.label}
                </span>
                <span
                  className={`font-semibold ${
                    isLoadingSummary
                      ? "text-steel-900 dark:text-steel-50"
                      : item.label === "Deduction"
                        ? "text-red-500 dark:text-red-400"
                        : currencyTone(item.value)
                  }`}
                >
                  {isLoadingSummary ? "—" : formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
            <h2 className="font-display text-lg font-bold text-steel-900 dark:text-steel-50">
              Yearly Expenses
            </h2>
            <p className="mb-4 text-sm text-steel-500 dark:text-steel-400">
              Monthly totals for {selectedYear}
            </p>
            {isLoadingLedger ? (
              <div className="flex h-64 items-center justify-center text-sm text-steel-500">
                Loading chart...
              </div>
            ) : ledger.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-steel-500">
                No yearly expense data available.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yearlyExpenseChartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-steel-200)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "var(--color-steel-500)" }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--color-steel-200)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--color-steel-500)" }}
                      tickLine={false}
                      axisLine={false}
                      width={56}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ borderRadius: 6, borderColor: "#d5dce5" }}
                    />
                    <Bar
                      dataKey="total"
                      name="Expenses"
                      fill="var(--color-amber-400)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
            <h2 className="font-display text-lg font-bold text-steel-900 dark:text-steel-50">
              Expenses by Category
            </h2>
            <p className="mb-4 text-sm text-steel-500 dark:text-steel-400">
              {monthName(selectedMonth)} {selectedYear}
            </p>
            {isLoadingExpenses ? (
              <div className="flex h-64 items-center justify-center text-sm text-steel-500">
                Loading chart...
              </div>
            ) : expenseCategoryChartData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-steel-500">
                No expense data for this month.
              </div>
            ) : (
              <div>
                <div className="relative h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategoryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius="42%"
                        outerRadius="68%"
                        paddingAngle={2}
                      >
                        {expenseCategoryChartData.map((entry) => (
                          <Cell
                            key={entry.type}
                            fill={EXPENSE_TYPE_COLORS[entry.type]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          borderRadius: 6,
                          borderColor: "#d5dce5",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute left-1/2 top-[45%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
                      Total
                    </span>
                    <span className="whitespace-nowrap text-[11px] font-bold text-steel-900 dark:text-steel-50">
                      {formatCurrency(totalCategoryExpenses)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {expenseCategoryChartData.map((item) => (
                    <div
                      key={item.type}
                      className="flex min-w-0 items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-sm"
                          style={{
                            backgroundColor: EXPENSE_TYPE_COLORS[item.type],
                          }}
                          aria-hidden="true"
                        />
                        <span className="truncate text-steel-600 dark:text-steel-300">
                          {item.name}
                        </span>
                      </div>
                      <span className="shrink-0 font-medium text-steel-900 dark:text-steel-100">
                        {formatCurrency(item.value)} ·{" "}
                        {((item.value / totalCategoryExpenses) * 100).toFixed(
                          1,
                        )}
                        %
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-steel-900 dark:text-steel-50">
              Yearly Ledger
            </h2>
            <Button
              type="button"
              variant="primary"
              icon={<Download className="size-4" aria-hidden="true" />}
              onClick={downloadYearlyLedger}
              disabled={isLoadingLedger || ledger.length === 0}
              isLoading={isLoadingLedger}
            >
              {" "}
              Download Excel
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1080px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-steel-200 bg-steel-100/60 dark:border-steel-800 dark:bg-steel-900/70">
                  {[
                    "Month",
                    "Salary",
                    "Advance",
                    "Medical",
                    "Meal",
                    "Transport",
                    "Misc",
                    "Bonus",

                    "Deduction",
                    "Expenses",
                    "Carry Forward",
                    "Payable",
                  ].map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-3 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoadingLedger ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-3 py-6 text-center text-steel-500"
                    >
                      Loading ledger...
                    </td>
                  </tr>
                ) : ledger.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-3 py-6 text-center text-steel-500"
                    >
                      No ledger data available for this year.
                    </td>
                  </tr>
                ) : (
                  ledger.map((row) => (
                    <tr
                      key={`${row.year}-${row.month}`}
                      className={
                        row.month === selectedMonth
                          ? "border-b border-steel-200 bg-amber-50/60 dark:border-steel-800 dark:bg-amber-500/5"
                          : "border-b border-steel-200 dark:border-steel-800"
                      }
                    >
                      <td className="px-3 py-3 font-medium text-steel-900 dark:text-steel-50">
                        {monthName(row.month)}
                      </td>
                      <td className="px-3 py-3">
                        {formatCurrency(row.salary)}
                      </td>
                      <td className="px-3 py-3">
                        {formatCurrency(row.totalAdvances)}
                      </td>
                      <td className="px-3 py-3">
                        {formatCurrency(row.totalMedical)}
                      </td>
                      <td className="px-3 py-3">
                        {formatCurrency(row.totalMeal)}
                      </td>
                      <td className="px-3 py-3">
                        {formatCurrency(row.totalTransport)}
                      </td>
                      <td className="px-3 py-3">
                        {formatCurrency(row.totalMiscellaneous)}
                      </td>
                      <td className="px-3 py-3">
                        {formatCurrency(row.totalBonus ?? 0)}
                      </td>
                      <td className="px-3 py-3">
                        {formatCurrency(row.totalDeductions ?? 0)}
                      </td>
                      <td className="px-3 py-3">
                        {formatCurrency(row.totalExpenses)}
                      </td>

                      <td className="px-3 py-3">
                        {formatCurrency(row.openingCarryForward)}
                      </td>
                      <td
                        className={`px-3 py-3 font-semibold ${currencyTone(row.amountPayable)}`}
                      >
                        {formatCurrency(row.amountPayable)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
          <h2 className="mb-4 font-display text-xl font-bold text-steel-900 dark:text-steel-50">
            {monthName(selectedMonth)} Expenses
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-steel-200 bg-steel-100/60 dark:border-steel-800 dark:bg-steel-900/70">
                  {["Date", "Type", "Amount", "Note", "Action"].map(
                    (column) => (
                      <th
                        key={column}
                        scope="col"
                        className="px-3 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400"
                      >
                        {column}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoadingExpenses ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-steel-500"
                    >
                      Loading expenses...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-steel-500"
                    >
                      No expenses recorded for this month.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-steel-200 dark:border-steel-800"
                    >
                      <td className="px-3 py-3 text-steel-700 dark:text-steel-200">
                        {formatExpenseDate(expense.expenseDate)}
                      </td>
                      <td className="px-3 py-3 text-steel-700 dark:text-steel-200">
                        {STAFF_EXPENSE_TYPE_LABELS[expense.expenseType]}
                      </td>
                      <td className="px-3 py-3 font-medium text-steel-900 dark:text-steel-50">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-3 py-3 text-steel-700 dark:text-steel-200">
                        {expense.note || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setEditingExpense(expense);
                            setIsExpenseModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <StaffExpenseModal
          staffId={staffId ?? ""}
          open={isExpenseModalOpen}
          expense={editingExpense}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          onSaved={handleExpenseSaved}
        />
      </div>
    </AppLayout>
  );
}
