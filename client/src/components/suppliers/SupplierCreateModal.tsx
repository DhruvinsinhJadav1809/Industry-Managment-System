import { Formik, Form } from "formik";
import { Building2, Hash, Mail, MapPin, Phone, Save, User } from "lucide-react";
import { useState } from "react";
import { Alert, Button, Modal, TextField } from "../common";
import {
  supplierSchema,
  type SupplierFormValues,
} from "../../lib/validations/supplierSchemas";
import { zodToFormikValidate } from "../../lib/validations/zodFormik";
import { supplierService } from "../../services/supplierService";
import type { ApiErrorShape } from "../../lib/axios";
import type { Supplier } from "../../types/supplier";

interface SupplierCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (supplier: Supplier) => void;
}

const initialValues: SupplierFormValues = {
  name: "",
  code: "",
  contactPerson: "",
  email: "",
  phone: "",
  gstNumber: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
};

export function SupplierCreateModal({
  open,
  onClose,
  onCreated,
}: SupplierCreateModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (
    values: SupplierFormValues,
    helpers: {
      setSubmitting: (v: boolean) => void;
      setErrors: (errors: Record<string, string>) => void;
      resetForm: () => void;
    },
  ) => {
    setApiError(null);
    try {
      const res = await supplierService.create({
        ...values,
        code: values.code.toUpperCase(),
        gstNumber: values.gstNumber.toUpperCase(),
      });
      helpers.resetForm();
      onCreated(res.data);
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
      title="New supplier"
      description="Add a supplier to source materials and products from."
    >
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(supplierSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form noValidate className="flex flex-col gap-2 px-2">
            {apiError && <Alert variant="error">{apiError}</Alert>}

            <div className="grid grid-cols-2 gap-4">
              <TextField
                name="name"
                label="Supplier name"
                placeholder="ABC Hardware Pvt Ltd"
                icon={<Building2 className="size-4" aria-hidden="true" />}
              />
              <TextField
                name="code"
                label="Code"
                placeholder="SUP001"
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
                placeholder="John Smith"
                icon={<User className="size-4" aria-hidden="true" />}
              />
              <TextField
                name="phone"
                label="Phone"
                placeholder="9876543210"
                icon={<Phone className="size-4" aria-hidden="true" />}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField
                name="email"
                type="email"
                label="Email"
                placeholder="john@abchardware.com"
                icon={<Mail className="size-4" aria-hidden="true" />}
              />
              <TextField
                name="gstNumber"
                label="GST number"
                placeholder="24ABCDE1234F1Z5"
                hint="15-character GSTIN"
                onChange={(e) =>
                  setFieldValue("gstNumber", e.target.value.toUpperCase())
                }
              />
            </div>

            <TextField
              name="address"
              label="Address"
              placeholder="Satellite Road"
              icon={<MapPin className="size-4" aria-hidden="true" />}
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField name="city" label="City" placeholder="Ahmedabad" />
              <TextField name="state" label="State" placeholder="Gujarat" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField name="country" label="Country" placeholder="India" />
              <TextField
                name="postalCode"
                label="Postal code"
                placeholder="380015"
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
                Create supplier
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
