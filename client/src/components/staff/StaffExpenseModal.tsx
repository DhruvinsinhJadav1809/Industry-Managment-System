import { Formik, Form } from "formik";
import { Save } from "lucide-react";
import { useState } from "react";
import { Alert, Button, Modal, Select, TextField } from "../common";
import { STAFF_EXPENSE_TYPE_OPTIONS } from "../../constants/staffledger";
import {
  staffExpenseSchema,
  type StaffExpenseFormValues,
} from "../../lib/validations/staffexpensesSchema";
import { zodToFormikValidate } from "../../lib/validations/zodFormik";
import { staffService } from "../../services/staffservice";
import type { ApiErrorShape } from "../../lib/axios";
import type { StaffExpense } from "../../types/staff";

interface StaffExpenseModalProps {
  staffId: string;
  open: boolean;
  /** Present in edit mode; null/undefined means "add" mode. */
  expense?: StaffExpense | null;
  onClose: () => void;
  onSaved: () => void;
}

const blankValues: StaffExpenseFormValues = {
  expenseType: "ADVANCE",
  amount: 0,
  expenseDate: new Date().toISOString().slice(0, 10),
  note: "",
};

export function StaffExpenseModal({
  staffId,
  open,
  expense,
  onClose,
  onSaved,
}: StaffExpenseModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const isEdit = Boolean(expense);

  const initialValues: StaffExpenseFormValues = expense
    ? {
        expenseType: expense.expenseType,
        amount: expense.amount,
        expenseDate: expense.expenseDate.slice(0, 10),
        note: expense.note ?? "",
      }
    : blankValues;

  const handleSubmit = async (
    values: StaffExpenseFormValues,
    helpers: {
      setSubmitting: (v: boolean) => void;
      setErrors: (errors: Record<string, string>) => void;
    },
  ) => {
    setApiError(null);
    try {
      const payload = {
        expenseType: values.expenseType,
        amount: values.amount,
        expenseDate: values.expenseDate,
        note: values.note || undefined,
      };
      if (isEdit && expense) {
        await staffService.updateStaffExpense(staffId, expense.id, payload);
      } else {
        await staffService.createStaffExpense(staffId, payload);
      }
      onSaved();
    } catch (err) {
      const apiErr = err as ApiErrorShape;
      setApiError(apiErr.message);
      if (apiErr.fieldErrors) helpers.setErrors(apiErr.fieldErrors);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit expense" : "Add expense"}
      description={
        isEdit
          ? "Update this expense entry."
          : "Record a new expense for this staff member."
      }
    >
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(staffExpenseSchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form noValidate className="flex flex-col gap-4">
            {apiError && <Alert variant="error">{apiError}</Alert>}

            <Select
              label="Expense type"
              value={values.expenseType}
              onChange={(e) => setFieldValue("expenseType", e.target.value)}
              options={STAFF_EXPENSE_TYPE_OPTIONS}
            />

            <TextField
              name="amount"
              type="number"
              label="Amount"
              min="0"
              step="0.01"
              value={values.amount || ""}
              onChange={(e) =>
                setFieldValue(
                  "amount",
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
            />

            <TextField name="expenseDate" type="date" label="Expense date" />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="staff-expense-note"
                className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
              >
                Note
              </label>
              <textarea
                id="staff-expense-note"
                value={values.note}
                onChange={(e) => setFieldValue("note", e.target.value)}
                rows={2}
                placeholder="Optional note"
                className="w-full resize-none rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none transition-colors placeholder:text-steel-400 focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:placeholder:text-steel-500 dark:focus:border-amber-400/70"
              />
            </div>

            <div className="mt-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                icon={<Save className="size-4" aria-hidden="true" />}
              >
                {isEdit ? "Save changes" : "Add expense"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
