import { Formik, Form } from "formik";
import { Save, UserCog } from "lucide-react";
import { useState } from "react";
import { Alert, Button, Modal } from "../common";
import { ManagerPicker } from "./ManagerPicker";
import {
  assignManagerSchema,
  type AssignManagerFormValues,
} from "../../lib/validations/departmentSchemas";
import { zodToFormikValidate } from "../../lib/validations/zodFormik";
import { departmentService } from "../../services/departmentService";
import type { ApiErrorShape } from "../../lib/axios";
import type { DepartmentListItem } from "../../types/department";

interface AssignManagerModalProps {
  department: DepartmentListItem | null;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignManagerModal({
  department,
  onClose,
  onAssigned,
}: AssignManagerModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  if (!department) return null;

  const initialValues: AssignManagerFormValues = {
    managerId: department.manager?.id ?? "",
  };
  const initialLabel = department.manager
    ? `${department.manager.fullName} — ${department.manager.email}`
    : null;

  const handleSubmit = async (
    values: AssignManagerFormValues,
    helpers: { setSubmitting: (v: boolean) => void }
  ) => {
    setApiError(null);
    try {
      await departmentService.assignManager(department.id, values);
      onAssigned();
    } catch (err) {
      setApiError((err as ApiErrorShape).message);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Modal
      open={Boolean(department)}
      onClose={onClose}
      title={
        <>
          <UserCog className="mr-1.5 inline size-4" aria-hidden="true" />
          Assign manager
        </>
      }
      description={`Choose who manages ${department.name} (${department.code}).`}
    >
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(assignManagerSchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, errors, setFieldValue }) => (
          <Form noValidate className="flex flex-col gap-4">
            {apiError && <Alert variant="error">{apiError}</Alert>}

            <ManagerPicker
              value={values.managerId}
              initialLabel={initialLabel}
              onChange={(id) => setFieldValue("managerId", id ?? "")}
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
                Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
