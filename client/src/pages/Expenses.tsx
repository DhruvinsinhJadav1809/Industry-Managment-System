import { Form, Formik, Field, ErrorMessage } from "formik";
import {
  CalendarDays,
  Download,
  Edit3,
  FileText,
  Loader2,
  Plus,
  PieChart as PieChartIcon,
  Receipt,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Alert,
  Button,
  ConfirmDialog,
  Modal,
  Select,
  TextField,
} from "../components/common";
import { ManagerPicker } from "../components/departments/ManagerPicker";
import { AppLayout } from "../layouts/AppLayout";
import { useToast } from "../context/ToastContext";
import {
  expenseSchema,
  type ExpenseFormValues,
} from "../lib/validations/expenseschemas";
import { zodToFormikValidate } from "../lib/validations/zodFormik";
import {
  downloadBlob,
  fileNameFromContentDisposition,
} from "../lib/downloadFile";
import { expenseService } from "../services/expenseservice";
import { EXPENSE_TYPE_OPTIONS } from "../constants/expenseTypeOptions";
import { PAYMENT_TYPE_OPTIONS } from "../constants/paymenttypeoptions";
import type { ApiErrorShape } from "../lib/axios";
import type { Expense } from "../types/expense";

const today = new Date();
const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
const currentDate = `${currentMonth}-${String(today.getDate()).padStart(2, "0")}`;

const emptyValues: ExpenseFormValues = {
  expenseType: "",
  amount: 0,
  expenseDate: currentDate,
  paymentType: "",
  paidBy: "",
  referenceNumber: "",
  note: "",
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function userId(user: string | { id: string }) {
  return typeof user === "string" ? user : user.id;
}

function userName(user: string | { id: string; name: string }) {
  return typeof user === "string" ? user : user.name;
}

const CHART_COLORS = [
  "#355C7D", // Dark Slate Blue / Rent / Cheque
  "#C06C84", // Rose / Transport / Cash
  "#F67280", // Coral Pink / Electricity / Online
  "#6C5B7B", // Deep Lavender / Miscellaneous / Card
  "#2A9D8F", // Teal / Maintenance
  "#E9C46A", // Golden Amber / Salary
  "#E76F51", // Burnt Orange / Office
  "#457B9D", // Steel Blue / Packaging
];

function ExpensePieChart({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  return (
    <div className="rounded-lg border border-steel-200 bg-white p-5 dark:border-steel-800 dark:bg-steel-900/60">
      <h2 className="font-display text-base font-bold text-steel-900 dark:text-steel-50">
        {title}
      </h2>
      {data.length === 0 ? (
        <div className="flex h-80 items-center justify-center text-sm text-steel-500 dark:text-steel-400">
          No expense data for this month.
        </div>
      ) : (
        <div className="h-80 pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius="42%"
                outerRadius="68%"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatAmount(Number(value))}
                contentStyle={{ borderRadius: 6, borderColor: "#d5dce5" }}
              />
              <Legend
                verticalAlign="bottom"
                height={48}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function formValuesFromExpense(expense: Expense): ExpenseFormValues {
  return {
    expenseType: expense.expenseType,
    amount: expense.amount,
    expenseDate: expense.expenseDate.slice(0, 10),
    paymentType: expense.paymentType,
    paidBy: userId(expense.paidBy),
    referenceNumber: expense.referenceNumber ?? "",
    note: expense.note ?? "",
  };
}

function ExpenseForm({
  initialValues,
  paidByLabel,
  isEditing,
  onClose,
  onSaved,
}: {
  initialValues: ExpenseFormValues;
  paidByLabel: string | null;
  isEditing: boolean;
  onClose: () => void;
  onSaved: (values: ExpenseFormValues, isEditing: boolean) => Promise<void>;
}) {
  return (
    <Formik
      initialValues={initialValues}
      validate={zodToFormikValidate(expenseSchema)}
      enableReinitialize
      onSubmit={async (values, helpers) => {
        try {
          await onSaved(values, isEditing);
        } catch (err) {
          const apiError = err as ApiErrorShape;
          if (apiError.fieldErrors) helpers.setErrors(apiError.fieldErrors);
          else helpers.setStatus(apiError.message);
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, setFieldValue, status, values }) => (
        <Form noValidate className="flex flex-col gap-4">
          {status && <Alert variant="error">{status}</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Expense type"
              value={values.expenseType}
              onChange={(event) =>
                setFieldValue("expenseType", event.target.value)
              }
              options={[...EXPENSE_TYPE_OPTIONS]}
              placeholder="Select expense type"
            />
            <TextField
              name="amount"
              label="Amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="2500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="expenseDate" label="Expense date" type="date" />
            <Select
              label="Payment type"
              value={values.paymentType}
              onChange={(event) =>
                setFieldValue("paymentType", event.target.value)
              }
              options={[...PAYMENT_TYPE_OPTIONS]}
              placeholder="Select payment type"
            />
          </div>

          <ManagerPicker
            label="Paid by"
            value={values.paidBy}
            initialLabel={paidByLabel}
            onChange={(id) => setFieldValue("paidBy", id ?? "")}
          />
          <ErrorMessage name="paidBy">
            {(message) => (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {message}
              </p>
            )}
          </ErrorMessage>

          <TextField
            name="referenceNumber"
            label="Reference number"
            placeholder="TXN-12345"
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="expense-note"
              className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
            >
              Note
            </label>
            <Field
              as="textarea"
              id="expense-note"
              name="note"
              rows={3}
              placeholder="September electricity bill"
              className="w-full resize-y rounded-md border border-steel-200 bg-white/70 px-3.5 py-2.5 text-sm text-steel-900 outline-none transition-colors focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900/40 dark:text-steel-50 dark:focus:border-amber-400/70"
            />
            <ErrorMessage name="note">
              {(message) => (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  {message}
                </p>
              )}
            </ErrorMessage>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              icon={<FileText className="size-4" aria-hidden="true" />}
            >
              {isEditing ? "Save changes" : "Create expense"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default function Expenses() {
  const toast = useToast();
  const [month, setMonth] = useState(currentMonth);
  const [expenseType, setExpenseType] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [formExpense, setFormExpense] = useState<Expense | null | undefined>(
    undefined,
  );
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"table" | "charts">("table");

  const fetchExpenses = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await expenseService.list({
        month,
        expenseType: expenseType || undefined,
      });
      setExpenses(response.data);
    } catch (err) {
      setLoadError((err as ApiErrorShape).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [month, expenseType]);

  const typeOptions = useMemo(
    () =>
      [...new Set(expenses.map((expense) => expense.expenseType))]
        .sort()
        .map((type) => ({ value: type, label: type })),
    [expenses],
  );

  const handleSaved = async (values: ExpenseFormValues, isEditing: boolean) => {
    const payload = {
      ...values,
      amount: Number(values.amount),
      referenceNumber: values.referenceNumber || undefined,
      note: values.note || undefined,
    };
    if (isEditing && formExpense) {
      await expenseService.update(formExpense.id, payload);
      toast.success("Expense updated.");
    } else {
      await expenseService.create(payload);
      toast.success("Expense created.");
    }
    setFormExpense(undefined);
    await fetchExpenses();
  };

  const handleDelete = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    try {
      await expenseService.remove(deletingExpense.id);
      toast.success("Expense deleted.");
      setDeletingExpense(null);
      await fetchExpenses();
    } catch (err) {
      toast.error((err as ApiErrorShape).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await expenseService.exportExcel({ month });
      const fileName = fileNameFromContentDisposition(
        response.headers["content-disposition"],
        `expenses-${month}.xlsx`,
      );
      downloadBlob(response.data, fileName);
      toast.success("Expense export downloaded.");
    } catch (err) {
      toast.error((err as ApiErrorShape).message);
    } finally {
      setIsExporting(false);
    }
  };

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expenseTypeChartData = useMemo(
    () =>
      Object.entries(
        expenses.reduce<Record<string, number>>((totals, expense) => {
          totals[expense.expenseType] =
            (totals[expense.expenseType] ?? 0) + expense.amount;
          return totals;
        }, {}),
      ).map(([name, value]) => ({ name, value })),
    [expenses],
  );
  const paymentTypeChartData = useMemo(
    () =>
      Object.entries(
        expenses.reduce<Record<string, number>>((totals, expense) => {
          totals[expense.paymentType] =
            (totals[expense.paymentType] ?? 0) + expense.amount;
          return totals;
        }, {}),
      ).map(([name, value]) => ({ name, value })),
    [expenses],
  );
  const isFormOpen = formExpense !== undefined;
  const editing = formExpense !== null && formExpense !== undefined;

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
            <Receipt className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-steel-900 dark:text-steel-50">
              Expenses
            </h1>
            <p className="text-sm text-steel-500 dark:text-steel-400">
              {expenses.length} expense{expenses.length === 1 ? "" : "s"} ·{" "}
              {formatAmount(total)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleExport}
            isLoading={isExporting}
            icon={<Download className="size-4" aria-hidden="true" />}
          >
            Export
          </Button>
          <Button
            onClick={() => setFormExpense(null)}
            icon={<Plus className="size-4" aria-hidden="true" />}
          >
            Add expense
          </Button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <CalendarDays
            className="pointer-events-none absolute left-3 top-9 size-4 text-steel-400 dark:text-steel-500"
            aria-hidden="true"
          />
          <label
            htmlFor="expense-month"
            className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
          >
            Month
          </label>
          <input
            id="expense-month"
            type="month"
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setExpenseType("");
            }}
            className="w-full rounded-md border border-steel-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:focus:border-amber-400/70"
          />
        </div>
        <Select
          label="Expense type"
          value={expenseType}
          onChange={(event) => setExpenseType(event.target.value)}
          options={typeOptions}
          placeholder="All expense types"
        />
      </div>

      <div className="mb-5 flex gap-1 border-b border-steel-200 dark:border-steel-800">
        <button
          type="button"
          onClick={() => setActiveTab("table")}
          className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "table"
              ? "border-steel-800 text-steel-900 dark:border-amber-400 dark:text-steel-50"
              : "border-transparent text-steel-500 hover:text-steel-800 dark:text-steel-400 dark:hover:text-steel-100"
          }`}
        >
          <Receipt className="size-4" aria-hidden="true" />
          Expenses
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("charts")}
          className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "charts"
              ? "border-steel-800 text-steel-900 dark:border-amber-400 dark:text-steel-50"
              : "border-transparent text-steel-500 hover:text-steel-800 dark:text-steel-400 dark:hover:text-steel-100"
          }`}
        >
          <PieChartIcon className="size-4" aria-hidden="true" />
          Charts
        </button>
      </div>

      {loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : activeTab === "charts" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <ExpensePieChart
            title="Expenses by category"
            data={expenseTypeChartData}
          />
          <ExpensePieChart
            title="Expenses by payment type"
            data={paymentTypeChartData}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-900/60">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-steel-500 dark:text-steel-400">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-16 text-center text-sm text-steel-500 dark:text-steel-400">
              No expenses found for this month.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-steel-200 bg-steel-50 dark:border-steel-800 dark:bg-steel-950/60">
                  <tr>
                    {[
                      "Type",
                      "Date",
                      "Paid by",
                      "Payment",
                      "Amount",
                      "Note",
                      "Created by",
                      "",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-steel-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-steel-50/70 dark:hover:bg-steel-800/30"
                    >
                      <td className="px-4 py-3 font-medium text-steel-900 dark:text-steel-50">
                        {expense.expenseType}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-steel-600 dark:text-steel-300">
                        {formatDate(expense.expenseDate)}
                      </td>
                      <td
                        className="max-w-40 truncate px-4 py-3 text-steel-600 dark:text-steel-300"
                        title={userName(expense.paidBy)}
                      >
                        {userName(expense.paidBy)}
                      </td>
                      <td className="px-4 py-3 text-steel-600 dark:text-steel-300">
                        {expense.paymentType}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-steel-900 dark:text-steel-50">
                        {formatAmount(expense.amount)}
                      </td>
                      <td
                        className="max-w-52 truncate px-4 py-3 text-steel-500"
                        title={expense.note}
                      >
                        {expense.note || "-"}
                      </td>
                      <td className="max-w-40 truncate px-4 py-3 text-steel-600 dark:text-steel-300">
                        {expense.createdBy.name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            aria-label="Edit expense"
                            onClick={() => setFormExpense(expense)}
                            className="rounded-md p-2 text-steel-400 hover:bg-steel-100 hover:text-steel-800 dark:hover:bg-steel-800 dark:hover:text-steel-100"
                          >
                            <Edit3 className="size-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete expense"
                            onClick={() => setDeletingExpense(expense)}
                            className="rounded-md p-2 text-steel-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        open={isFormOpen}
        onClose={() => setFormExpense(undefined)}
        title={editing ? "Edit expense" : "Add expense"}
        description={
          editing
            ? "Update the expense details."
            : "Record a new business expense."
        }
      >
        {isFormOpen && (
          <ExpenseForm
            key={editing ? formExpense.id : "new"}
            initialValues={
              editing ? formValuesFromExpense(formExpense) : emptyValues
            }
            paidByLabel={editing ? userName(formExpense.paidBy) : null}
            isEditing={editing}
            onClose={() => setFormExpense(undefined)}
            onSaved={handleSaved}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingExpense)}
        title="Delete expense"
        description={
          deletingExpense
            ? `Delete ${deletingExpense.expenseType} expense of ${formatAmount(deletingExpense.amount)}? This can't be undone.`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingExpense(null)}
      />
    </AppLayout>
  );
}
