import { Formik, Form } from "formik";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Select, TextField } from "../components/common";
import { SaleItemRow } from "../components/sales/SalesItemRows";
import { AppLayout } from "../layouts/AppLayout";
import { useToast } from "../context/ToastContext";
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "../constants/paymentOptions";
import {
  createSaleSchema,
  type CreateSaleFormValues,
  type SaleItemFormValues,
} from "../lib/validations/salesSchemas";
import { zodToFormikValidate } from "../lib/validations/zodFormik";
import { saleService } from "../services/salesService";
import type { ApiErrorShape } from "../lib/axios";
import type { CreateSalePayload } from "../types/sale";

const emptyItem: SaleItemFormValues = {
  productId: "",
  productLabel: "",
  quantity: 0,
  rate: 0,
  gstPercentage: 0,
};

const initialValues: CreateSaleFormValues = {
  saleDate: new Date().toISOString().slice(0, 10),
  customerName: "",
  customerPhone: "",
  items: [emptyItem],
  discountAmount: 0,
  paymentMethod: PAYMENT_METHOD_OPTIONS[0],
  paymentStatus: PAYMENT_STATUS_OPTIONS[0],
  notes: "",
};

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SaleCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  // Stable per-row ids, independent of array index, so a ProductPicker row's
  // internal state doesn't get reused for the wrong item after add/remove.
  const [rowKeys, setRowKeys] = useState<string[]>([crypto.randomUUID()]);

  const handleSubmit = async (
    values: CreateSaleFormValues,
    helpers: {
      setSubmitting: (v: boolean) => void;
      setErrors: (errors: Record<string, string>) => void;
    },
  ) => {
    setApiError(null);
    try {
      const payload: CreateSalePayload = {
        saleDate: new Date(values.saleDate).toISOString(),
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        items: values.items.map(
          ({ productId, quantity, rate, gstPercentage }) => ({
            productId,
            quantity,
            rate,
            gstPercentage,
          }),
        ),
        discountAmount: values.discountAmount || 0,
        paymentMethod: values.paymentMethod,
        paymentStatus: values.paymentStatus,
        notes: values.notes || undefined,
      };
      await saleService.create(payload);
      toast.success("Sale created.");
      navigate("/sales");
    } catch (err) {
      const apiErr = err as ApiErrorShape;
      setApiError(apiErr.message);
      if (apiErr.fieldErrors) helpers.setErrors(apiErr.fieldErrors);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <button
        type="button"
        onClick={() => navigate("/sales")}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-steel-500 hover:text-steel-800 dark:text-steel-400 dark:hover:text-amber-400"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to sales
      </button>

      <h1 className="mb-6 font-display text-xl font-bold text-steel-900 dark:text-steel-50">
        New sale
      </h1>

      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(createSaleSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, errors, setFieldValue }) => {
          const itemErrors =
            (errors.items as unknown as Array<
              Record<string, string> | undefined
            >) ?? [];
          const itemsError =
            typeof errors.items === "string" ? errors.items : undefined;

          const subtotal = values.items.reduce(
            (sum, i) => sum + (i.quantity || 0) * (i.rate || 0),
            0,
          );
          const taxAmount = values.items.reduce(
            (sum, i) =>
              sum +
              (i.quantity || 0) *
                (i.rate || 0) *
                ((i.gstPercentage || 0) / 100),
            0,
          );
          const grandTotal =
            subtotal + taxAmount - (values.discountAmount || 0);

          const updateItem = (
            index: number,
            patch: Partial<SaleItemFormValues>,
          ) => {
            const next = values.items.map((it, i) =>
              i === index ? { ...it, ...patch } : it,
            );
            setFieldValue("items", next);
          };

          const addItem = () => {
            setFieldValue("items", [...values.items, emptyItem]);
            setRowKeys((prev) => [...prev, crypto.randomUUID()]);
          };

          const removeItem = (index: number) => {
            setFieldValue(
              "items",
              values.items.filter((_, i) => i !== index),
            );
            setRowKeys((prev) => prev.filter((_, i) => i !== index));
          };

          return (
            <Form noValidate className="flex flex-col gap-6">
              {apiError && <Alert variant="error">{apiError}</Alert>}

              {/* Header fields */}
              <div className="corner-frame rounded-lg border border-steel-200 bg-white/70 p-6 dark:border-steel-800 dark:bg-steel-900/40">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    name="customerName"
                    label="Customer name"
                    placeholder="ABC Hardware"
                  />
                  <TextField
                    name="customerPhone"
                    label="Customer phone"
                    placeholder="9876543210"
                  />
                  <TextField name="saleDate" type="date" label="Sale date" />
                  <TextField
                    name="discountAmount"
                    type="number"
                    label="Discount"
                    min="0"
                    step="0.01"
                    value={values.discountAmount || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "discountAmount",
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                  />
                  <Select
                    label="Payment method"
                    value={values.paymentMethod}
                    onChange={(e) =>
                      setFieldValue("paymentMethod", e.target.value)
                    }
                    placeholder="Select a payment method"
                    options={PAYMENT_METHOD_OPTIONS.map((m) => ({
                      value: m,
                      label: m,
                    }))}
                  />
                  <Select
                    label="Payment status"
                    value={values.paymentStatus}
                    onChange={(e) =>
                      setFieldValue("paymentStatus", e.target.value)
                    }
                    placeholder="Select a payment status"
                    options={PAYMENT_STATUS_OPTIONS.map((s) => ({
                      value: s,
                      label: s,
                    }))}
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="notes"
                    className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={values.notes}
                    onChange={(e) => setFieldValue("notes", e.target.value)}
                    rows={2}
                    placeholder="Optional notes about this sale"
                    className="w-full resize-none rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none transition-colors placeholder:text-steel-400 focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:placeholder:text-steel-500 dark:focus:border-amber-400/70"
                  />
                </div>
              </div>

              {/* Line items */}
              <div className="corner-frame rounded-lg border border-steel-200 bg-white/70 p-6 dark:border-steel-800 dark:bg-steel-900/40">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
                    Items
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addItem}
                    icon={<Plus className="size-4" aria-hidden="true" />}
                  >
                    Add item
                  </Button>
                </div>

                {itemsError && (
                  <p className="mb-2 text-xs font-medium text-red-600 dark:text-red-400">
                    {itemsError}
                  </p>
                )}

                <div>
                  {values.items.map((item, index) => (
                    <SaleItemRow
                      key={rowKeys[index]}
                      index={index}
                      item={item}
                      error={itemErrors[index]}
                      onChange={updateItem}
                      onRemove={removeItem}
                      canRemove={values.items.length > 1}
                    />
                  ))}
                </div>
              </div>

              {/* Totals summary */}
              <div className="corner-frame ml-auto w-full max-w-xs rounded-lg border border-steel-200 bg-white/70 p-5 dark:border-steel-800 dark:bg-steel-900/40">
                <dl className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-steel-500 dark:text-steel-400">
                      Subtotal
                    </dt>
                    <dd className="font-mono text-steel-800 dark:text-steel-100">
                      {money(subtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-steel-500 dark:text-steel-400">GST</dt>
                    <dd className="font-mono text-steel-800 dark:text-steel-100">
                      {money(taxAmount)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-steel-500 dark:text-steel-400">
                      Discount
                    </dt>
                    <dd className="font-mono text-steel-800 dark:text-steel-100">
                      -{money(values.discountAmount || 0)}
                    </dd>
                  </div>
                  <div className="mt-1 flex justify-between border-t border-steel-200 pt-2 dark:border-steel-700">
                    <dt className="font-semibold text-steel-900 dark:text-steel-50">
                      Grand total
                    </dt>
                    <dd className="font-mono text-base font-bold text-steel-900 dark:text-steel-50">
                      {money(grandTotal)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/sales")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  icon={<Save className="size-4" aria-hidden="true" />}
                >
                  Create sale
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </AppLayout>
  );
}
