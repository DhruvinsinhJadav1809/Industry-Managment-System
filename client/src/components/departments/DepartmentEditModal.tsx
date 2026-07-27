import { Formik, Form } from "formik";
import { Building2, Save } from "lucide-react";
import { useState } from "react";
import { Alert, Button, Modal, TextField } from "../common";
import {
  updateDepartmentSchema,
  type UpdateDepartmentFormValues,
} from "../../lib/validations/departmentSchemas";
import { zodToFormikValidate } from "../../lib/validations/zodFormik";
import { departmentService } from "../../services/departmentService";
import type { ApiErrorShape } from "../../lib/axios";
import type { DepartmentListItem } from "../../types/department";

interface DepartmentEditModalProps {
  department: DepartmentListItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function DepartmentEditModal({
  department,
  onClose,
  onSaved,
}: DepartmentEditModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  if (!department) return null;

  const initialValues: UpdateDepartmentFormValues = {
    name: department.name,
    code: department.code,
    description: department.description,
    isActive: department.isActive,
  };

  const handleSubmit = async (
    values: UpdateDepartmentFormValues,
    helpers: {
      setSubmitting: (v: boolean) => void;
      setErrors: (errors: Record<string, string>) => void;
    }
  ) => {
    setApiError(null);
    try {
      await departmentService.update(department.id, {
        ...values,
        code: values.code.toUpperCase(),
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
      open={Boolean(department)}
      onClose={onClose}
      title="Edit department"
      description={`Update details for ${department.name}. Use "Assign manager" separately to change the manager.`}
    >
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(updateDepartmentSchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, errors, setFieldValue }) => (
          <Form noValidate className="flex flex-col gap-4">
            {apiError && <Alert variant="error">{apiError}</Alert>}

            <TextField
              name="name"
              label="Department name"
              icon={<Building2 className="size-4" aria-hidden="true" />}
            />

            <TextField
              name="code"
              label="Code"
              hint="Short unique code, letters/numbers/hyphens"
              onChange={(e) =>
                setFieldValue("code", e.target.value.toUpperCase())
              }
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-description"
                className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
              >
                Description
              </label>
              <textarea
                id="edit-description"
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

            <label className="flex items-center gap-2.5 pt-1 text-sm text-steel-700 dark:text-steel-300">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(e) => setFieldValue("isActive", e.target.checked)}
                className="size-4 rounded border-steel-300 text-steel-800 focus:ring-amber-400 dark:border-steel-600"
              />
              Department active
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
    </Modal>
  );
}
