import { Formik, Form } from "formik";
import {
  Building2,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, Button, Modal, TextField } from "../common";
import {
  editSupplierSchema,
  type EditSupplierFormValues,
} from "../../lib/validations/supplierSchemas";
import { zodToFormikValidate } from "../../lib/validations/zodFormik";
import { supplierService } from "../../services/supplierService";
import type { ApiErrorShape } from "../../lib/axios";
import type { Supplier } from "../../types/supplier";

interface SupplierEditModalProps {
  supplierId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function SupplierEditModal({
  supplierId,
  onClose,
  onSaved,
}: SupplierEditModalProps) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch fresh details via GET /suppliers/:id each time the modal opens.
  useEffect(() => {
    if (!supplierId) {
      setSupplier(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    supplierService
      .getById(supplierId)
      .then((res) => {
        if (!cancelled) setSupplier(res.data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError((err as ApiErrorShape).message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supplierId]);

  const handleSubmit = async (
    values: EditSupplierFormValues,
    helpers: {
      setSubmitting: (v: boolean) => void;
      setErrors: (errors: Record<string, string>) => void;
    },
  ) => {
    if (!supplierId) return;
    setApiError(null);
    try {
      await supplierService.update(supplierId, {
        ...values,
        code: values.code.toUpperCase(),
        gstNumber: values.gstNumber.toUpperCase(),
      });
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
      open={Boolean(supplierId)}
      onClose={onClose}
      title="Edit supplier"
      description={
        supplier ? `Update details for ${supplier.name}.` : undefined
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-steel-500 dark:text-steel-400">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading supplier…
        </div>
      ) : loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : supplier ? (
        <Formik
          initialValues={
            {
              name: supplier.name,
              code: supplier.code,
              contactPerson: supplier.contactPerson,
              email: supplier.email,
              phone: supplier.phone,
              gstNumber: supplier.gstNumber,
              address: supplier.address,
              city: supplier.city,
              state: supplier.state,
              country: supplier.country,
              postalCode: supplier.postalCode,
              isActive: supplier.isActive,
            } as EditSupplierFormValues
          }
          validate={zodToFormikValidate(editSupplierSchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form noValidate className="flex flex-col gap-2 px-2">
              {apiError && <Alert variant="error">{apiError}</Alert>}

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  name="name"
                  label="Supplier name"
                  icon={<Building2 className="size-4" aria-hidden="true" />}
                />
                <TextField
                  name="code"
                  label="Code"
                  icon={<Hash className="size-4" aria-hidden="true" />}
                  onChange={(e) =>
                    setFieldValue("code", e.target.value.toUpperCase())
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  name="contactPerson"
                  label="Contact person"
                  icon={<User className="size-4" aria-hidden="true" />}
                />
                <TextField
                  name="phone"
                  label="Phone"
                  icon={<Phone className="size-4" aria-hidden="true" />}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  name="email"
                  type="email"
                  label="Email"
                  icon={<Mail className="size-4" aria-hidden="true" />}
                />
                <TextField
                  name="gstNumber"
                  label="GST number"
                  hint="15-character GSTIN"
                  onChange={(e) =>
                    setFieldValue("gstNumber", e.target.value.toUpperCase())
                  }
                />
              </div>

              <TextField
                name="address"
                label="Address"
                icon={<MapPin className="size-4" aria-hidden="true" />}
              />

              <div className="grid grid-cols-2 gap-4">
                <TextField name="city" label="City" />
                <TextField name="state" label="State" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextField name="country" label="Country" />
                <TextField name="postalCode" label="Postal code" />
              </div>

              <label className="flex items-center gap-2.5 pt-1 text-sm text-steel-700 dark:text-steel-300">
                <input
                  type="checkbox"
                  checked={values.isActive}
                  onChange={(e) => setFieldValue("isActive", e.target.checked)}
                  className="size-4 rounded border-steel-300 text-steel-800 focus:ring-amber-400 dark:border-steel-600"
                />
                Supplier active
              </label>

              <div className="mt-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  icon={<Save className="size-4" aria-hidden="true" />}
                >
                  Save changes
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      ) : null}
    </Modal>
  );
}
