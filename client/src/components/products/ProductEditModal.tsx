import { Formik, Form } from "formik";
import { Hash, Loader2, Package, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, Button, Modal, Select, TextField } from "../common";
import { DepartmentPicker } from "./DepartmentPicker";
import {
  updateProductSchema,
  type UpdateProductFormValues,
} from "../../lib/validations/productSchemas";
import { zodToFormikValidate } from "../../lib/validations/zodFormik";
import { productService } from "../../services/productService";
import { UNIT_OPTIONS } from "../../constants/units";
import type { ApiErrorShape } from "../../lib/axios";
import type { Product } from "../../types/product";

interface ProductEditModalProps {
  productId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductEditModal({
  productId,
  onClose,
  onSaved,
}: ProductEditModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch fresh details via GET /products/:id each time the modal opens,
  // rather than trusting the (possibly stale) row data from the table.
  useEffect(() => {
    if (!productId) {
      setProduct(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    productService
      .getById(productId)
      .then((res) => {
        if (!cancelled) setProduct(res.data);
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
  }, [productId]);

  const handleSubmit = async (
    values: UpdateProductFormValues,
    helpers: {
      setSubmitting: (v: boolean) => void;
      setErrors: (errors: Record<string, string>) => void;
    },
  ) => {
    if (!productId) return;
    setApiError(null);
    try {
      const skuValue = values.sku.toUpperCase();
      const productCode = values.productCode.toUpperCase();
      await productService.update(productId, {
        ...values,
        sku: skuValue,
        productCode: productCode,
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
      open={Boolean(productId)}
      onClose={onClose}
      title="Edit product"
      description={product ? `Update details for ${product.name}.` : undefined}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-steel-500 dark:text-steel-400">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading product…
        </div>
      ) : loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : product ? (
        <Formik
          initialValues={
            {
              name: product.name,
              sku: product.sku,
              productCode: product.productCode,
              departmentId: product.department.id,
              description: product.description,
              unit: product.unit,
              costPrice: product.costPrice,
              sellingPrice: product.sellingPrice,
              isActive: product.isActive,
            } as UpdateProductFormValues
          }
          validate={zodToFormikValidate(updateProductSchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, errors, setFieldValue }) => (
            <Form noValidate className="flex flex-col gap-4 px-2">
              {apiError && <Alert variant="error">{apiError}</Alert>}

              <TextField
                name="name"
                label="Product name"
                icon={<Package className="size-4" aria-hidden="true" />}
              />

              <TextField
                name="sku"
                label="SKU"
                icon={<Hash className="size-4" aria-hidden="true" />}
                onChange={(e) =>
                  setFieldValue("sku", e.target.value.toUpperCase())
                }
              />
              <TextField
                name="productCode"
                label="Product Code"
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
                  htmlFor="edit-product-description"
                  className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
                >
                  Description
                </label>
                <textarea
                  id="edit-product-description"
                  value={values.description}
                  onChange={(e) => setFieldValue("description", e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none transition-colors focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:focus:border-amber-400/70"
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

              <label className="flex items-center gap-2.5 pt-1 text-sm text-steel-700 dark:text-steel-300">
                <input
                  type="checkbox"
                  checked={values.isActive}
                  onChange={(e) => setFieldValue("isActive", e.target.checked)}
                  className="size-4 rounded border-steel-300 text-steel-800 focus:ring-amber-400 dark:border-steel-600"
                />
                Product active
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
