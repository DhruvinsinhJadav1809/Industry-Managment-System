import { Formik, Form } from "formik";
import { Save } from "lucide-react";
import { useState } from "react";
import { Alert, Button, Modal, Select } from "../common";
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "../../constants/paymentOptions";
import {
  updateSalePaymentSchema,
  type UpdateSalePaymentPayload,
} from "../../lib/validations/salesSchemas";
import { zodToFormikValidate } from "../../lib/validations/zodFormik";
import { saleService } from "../../services/salesService";
import type { ApiErrorShape } from "../../lib/axios";
import type { SaleListItem } from "../../types/sale";

interface SaleEditPaymentModalProps {
  sale: SaleListItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function SalesEditPaymentModal({
  sale,
  onClose,
  onSaved,
}: SaleEditPaymentModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  if (!sale) return null;

  const initialValues: UpdateSalePaymentPayload = {
    paymentMethod: sale.paymentMethod,
    paymentStatus: sale.paymentStatus,
  };

  const handleSubmit = async (
    values: UpdateSalePaymentPayload,
    helpers: { setSubmitting: (v: boolean) => void },
  ) => {
    setApiError(null);
    try {
      await saleService.updatePayment(sale._id, values);
      onSaved();
    } catch (err) {
      setApiError((err as ApiErrorShape).message);
    } finally {
      onClose();
      helpers.setSubmitting(false);
    }
  };

  return (
    <Modal
      open={Boolean(sale)}
      onClose={onClose}
      title="Update payment"
      description={`${sale.saleNumber} — ${sale.customerName}`}
    >
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(updateSalePaymentSchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form noValidate className="flex flex-col gap-4">
            {apiError && <Alert variant="error">{apiError}</Alert>}

            <Select
              label="Payment method"
              value={values.paymentMethod}
              onChange={(e) => setFieldValue("paymentMethod", e.target.value)}
              options={PAYMENT_METHOD_OPTIONS.map((m) => ({
                value: m,
                label: m,
              }))}
            />

            <Select
              label="Payment status"
              value={values.paymentStatus}
              onChange={(e) => setFieldValue("paymentStatus", e.target.value)}
              options={PAYMENT_STATUS_OPTIONS.map((s) => ({
                value: s,
                label: s,
              }))}
            />

            <div className="mt-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                icon={<Save className="size-4" aria-hidden="true" />}
              >
                Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
