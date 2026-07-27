import { Formik, Form } from "formik";
import { Hash, Package, Save } from "lucide-react";
import { useState } from "react";
import { Alert, Button, Modal, Select, TextField } from "../common";
import { DepartmentPicker } from "./DepartmentPicker";
import {
  createProductSchema,
  type CreateProductFormValues,
} from "../../lib/validations/productSchemas";
import { zodToFormikValidate } from "../../lib/validations/zodFormik";
import { productService } from "../../services/productService";
import { UNIT_OPTIONS } from "../../constants/units";
import type { ApiErrorShape } from "../../lib/axios";
import type { Product } from "../../types/product";

interface ProductCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (product: Product) => void;
}

const initialValues: CreateProductFormValues = {
  name: "",
  sku: "",
  departmentId: "",
  description: "",
  unit: "",
  costPrice: 0,
  sellingPrice: 0,
  productCode: "",
};

export function ProductCreateModal({
  open,
  onClose,
  onCreated,
}: ProductCreateModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (
    values: CreateProductFormValues,
    helpers: {
      setSubmitting: (v: boolean) => void;
      setErrors: (errors: Record<string, string>) => void;
      resetForm: () => void;
    },
  ) => {
    setApiError(null);
    try {
      const skuValue = values.sku.toUpperCase();
      const productCode = values.productCode.toUpperCase();
      const res = await productService.create({
        name: values.name,
        sku: skuValue,
        productCode: productCode,
        departmentId: values.departmentId,
        description: values.description,
        unit: values.unit,
        costPrice: values.costPrice,
        sellingPrice: values.sellingPrice,
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
      title="New product"
      description="Add a product to the catalog under a department."
    >
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(createProductSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, errors, setFieldValue }) => (
          <Form noValidate className="flex flex-col gap-4 px-2">
            {apiError && <Alert variant="error">{apiError}</Alert>}

            <TextField
              name="name"
              label="Product name"
              placeholder={'SS Lever Handle 8"'}
              icon={<Package className="size-4" aria-hidden="true" />}
            />

            <TextField
              name="sku"
              label="SKU"
              placeholder="STL-001"
              icon={<Hash className="size-4" aria-hidden="true" />}
              onChange={(e) =>
                setFieldValue("sku", e.target.value.toUpperCase())
              }
            />
            <TextField
              name="productCode"
              label="Product Code"
              placeholder="STL-001"
              icon={<Hash className="size-4" aria-hidden="true" />}
              onChange={(e) =>
                setFieldValue("productCode", e.target.value.toUpperCase())
              }
            />
            <DepartmentPicker
              value={values.departmentId}
              onChange={(id) => setFieldValue("departmentId", id)}
              error={errors.departmentId}
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="product-description"
                className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
              >
                Description
              </label>
              <textarea
                id="product-description"
                value={values.description}
                onChange={(e) => setFieldValue("description", e.target.value)}
                rows={3}
                placeholder="What is this product?"
                className="w-full resize-none rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none transition-colors placeholder:text-steel-400 focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:placeholder:text-steel-500 dark:focus:border-amber-400/70"
              />
              {errors.description && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            <Select
              label="Unit"
              value={values.unit}
              onChange={(e) => setFieldValue("unit", e.target.value)}
              placeholder="Select a unit"
              options={UNIT_OPTIONS.map((u) => ({ value: u, label: u }))}
            />
            {errors.unit && (
              <p className="-mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.unit}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <TextField
                name="costPrice"
                type="number"
                label="Cost price"
                placeholder="250"
                min="0"
                step="0.01"
                value={values.costPrice || ""}
                onChange={(e) =>
                  setFieldValue(
                    "costPrice",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
              />
              <TextField
                name="sellingPrice"
                type="number"
                label="Selling price"
                placeholder="320"
                min="0"
                step="0.01"
                value={values.sellingPrice || ""}
                onChange={(e) =>
                  setFieldValue(
                    "sellingPrice",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
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
                Create product
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
