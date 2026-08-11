import { Formik, Form } from "formik";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, TextField } from "../components/common";
import { SupplierPicker } from "../components/purchases/SupplierPicker";
import { AppLayout } from "../layouts/AppLayout";
import { useToast } from "../context/ToastContext";
import {
  createPurchaseSchema,
  type CreatePurchaseFormValues,
  type PurchaseItemFormValues,
} from "../lib/validations/purchaseSchemas";
import { zodToFormikValidate } from "../lib/validations/zodFormik";
import { purchaseService } from "../services/purchaseService";
import type { ApiErrorShape } from "../lib/axios";
import type { CreatePurchasePayload } from "../types/purchase";
import { PurchaseItemRow } from "../components/purchases/PurchaseItemrow";
const emptyItem: PurchaseItemFormValues = {
  productId: "",
  productLabel: "",
  quantity: 0,
  unitPrice: 0,
  taxPercentage: 0,
};

const initialValues: CreatePurchaseFormValues = {
  supplierId: "",
  invoiceNumber: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  remarks: "",
  discount: 0,
  items: [emptyItem],
};

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PurchaseCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  // Stable per-row ids, independent of array index, so a ProductPicker row's
  // internal state doesn't get reused for the wrong item after add/remove.
  const [rowKeys, setRowKeys] = useState<string[]>([crypto.randomUUID()]);

  const handleSubmit = async (
    values: CreatePurchaseFormValues,
    helpers: {
      setSubmitting: (v: boolean) => void;
      setErrors: (errors: Record<string, string>) => void;
    },
  ) => {
    setApiError(null);
    try {
      const payload: CreatePurchasePayload = {
        supplierId: values.supplierId,
        invoiceNumber: values.invoiceNumber,
        purchaseDate: values.purchaseDate,
        remarks: values.remarks || undefined,
        discount: values.discount || 0,
        items: values.items.map(
          ({ productId, quantity, unitPrice, taxPercentage }) => ({
            productId,
            quantity,
            unitPrice,
            taxPercentage,
          }),
        ),
      };
      const res = await purchaseService.create(payload);
      toast.success(`Purchase ${res.data.purchaseNumber} created.`);
      navigate("/purchases");
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
        onClick={() => navigate("/purchases")}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-steel-500 hover:text-steel-800 dark:text-steel-400 dark:hover:text-amber-400"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to purchases
      </button>

      <h1 className="mb-6 font-display text-xl font-bold text-steel-900 dark:text-steel-50">
        New purchase
      </h1>

      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(createPurchaseSchema)}
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
            (sum, i) => sum + (i.quantity || 0) * (i.unitPrice || 0),
            0,
          );
          const taxAmount = values.items.reduce(
            (sum, i) =>
              sum +
              (i.quantity || 0) *
                (i.unitPrice || 0) *
                ((i.taxPercentage || 0) / 100),
            0,
          );
          const grandTotal = subtotal + taxAmount - (values.discount || 0);

          const updateItem = (
            index: number,
            patch: Partial<PurchaseItemFormValues>,
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
                  <SupplierPicker
                    value={values.supplierId}
                    onChange={(id) => setFieldValue("supplierId", id)}
                    error={errors.supplierId}
                  />
                  <TextField
                    name="invoiceNumber"
                    label="Invoice number"
                    placeholder="INV-2026-001"
                  />
                  <TextField
                    name="purchaseDate"
                    type="date"
                    label="Purchase date"
                  />
                  <TextField
                    name="discount"
                    type="number"
                    label="Discount"
                    min="0"
                    step="0.01"
                    value={values.discount || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "discount",
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="remarks"
                    className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
                  >
                    Remarks
                  </label>
                  <textarea
                    id="remarks"
                    value={values.remarks}
                    onChange={(e) => setFieldValue("remarks", e.target.value)}
                    rows={2}
                    placeholder="Optional notes about this purchase"
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
                    <PurchaseItemRow
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
                    <dt className="text-steel-500 dark:text-steel-400">Tax</dt>
                    <dd className="font-mono text-steel-800 dark:text-steel-100">
                      {money(taxAmount)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-steel-500 dark:text-steel-400">
                      Discount
                    </dt>
                    <dd className="font-mono text-steel-800 dark:text-steel-100">
                      -{money(values.discount || 0)}
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
                  onClick={() => navigate("/purchases")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  icon={<Save className="size-4" aria-hidden="true" />}
                >
                  Create purchase
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </AppLayout>
  );
}
