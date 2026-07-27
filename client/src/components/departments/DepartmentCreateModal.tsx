import { Formik, Form } from "formik";
import { Building2, Save } from "lucide-react";
import { useState } from "react";
import { Alert, Button, Modal, TextField } from "../common";
import { ManagerPicker } from "./ManagerPicker";
import {
  createDepartmentSchema,
  type CreateDepartmentFormValues,
} from "../../lib/validations/departmentSchemas";
import { zodToFormikValidate } from "../../lib/validations/zodFormik";
import { departmentService } from "../../services/departmentService";
import type { ApiErrorShape } from "../../lib/axios";

interface DepartmentCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const initialValues: CreateDepartmentFormValues = {
  name: "",
  code: "",
  description: "",
  managerId: undefined,
};

export function DepartmentCreateModal({
  open,
  onClose,
  onCreated,
}: DepartmentCreateModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (
    values: CreateDepartmentFormValues,
    helpers: {
      setSubmitting: (v: boolean) => void;
      setErrors: (errors: Record<string, string>) => void;
      resetForm: () => void;
    }
  ) => {
    setApiError(null);
    try {
      await departmentService.create({
        ...values,
        code: values.code.toUpperCase(),
      });
      helpers.resetForm();
      onCreated();
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
      title="New department"
      description="Set up a department and optionally assign a manager now."
    >
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(createDepartmentSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, errors, setFieldValue }) => (
          <Form noValidate className="flex flex-col gap-4">
            {apiError && <Alert variant="error">{apiError}</Alert>}

            <TextField
              name="name"
              label="Department name"
              placeholder="Production"
              icon={<Building2 className="size-4" aria-hidden="true" />}
            />

            <TextField
              name="code"
              label="Code"
              placeholder="PROD"
              hint="Short unique code, letters/numbers/hyphens"
              onChange={(e) =>
                setFieldValue("code", e.target.value.toUpperCase())
              }
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
              >
                Description
              </label>
              <textarea
                id="description"
                value={values.description}
                onChange={(e) => setFieldValue("description", e.target.value)}
                rows={3}
                placeholder="What does this department handle?"
                className="w-full resize-none rounded-md border border-steel-200 bg-white/70 px-3.5 py-2.5 text-sm text-steel-900 outline-none transition-colors placeholder:text-steel-400 focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900/40 dark:text-steel-50 dark:placeholder:text-steel-500 dark:focus:border-amber-400/70"
              />
              {errors.description && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            <ManagerPicker
              value={values.managerId}
              onChange={(id) => setFieldValue("managerId", id)}
              error={errors.managerId}
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
                Create department
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
