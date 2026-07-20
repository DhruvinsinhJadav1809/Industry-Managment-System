import { Formik, Form } from "formik";
import { Mail, Save, User } from "lucide-react";
import { useState } from "react";
import { Alert, Button, Modal, TextField } from "../common";
import { Select } from "../common/Select";
import { ROLE_OPTIONS } from "../../constants/roles";
import {
  updateUserSchema,
  type UpdateUserFormValues,
} from "../../lib/validations/userSchemas";
import { zodToFormikValidate } from "../../lib/validations/zodFormik";
import { userService } from "../../services/userService";
import type { ApiErrorShape } from "../../lib/axios";
import type { UserListItem } from "../../types/user";

interface UserEditModalProps {
  user: UserListItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function UserEditModal({ user, onClose, onSaved }: UserEditModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  if (!user) return null;

  const initialValues: UpdateUserFormValues = {
    fullName: user.fullName,
    email: user.email,
    roleId: user.roleId,
    isActive: user.isActive,
  };

  const handleSubmit = async (
    values: UpdateUserFormValues,
    helpers: { setSubmitting: (v: boolean) => void }
  ) => {
    setApiError(null);
    try {
      await userService.update(user.id, values);
      onSaved();
    } catch (err) {
      setApiError((err as ApiErrorShape).message);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      title="Edit user"
      description={`Update details for ${user.fullName}.`}
    >
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(updateUserSchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form noValidate className="flex flex-col gap-4">
            {apiError && <Alert variant="error">{apiError}</Alert>}

            <TextField
              name="fullName"
              label="Full name"
              icon={<User className="size-4" aria-hidden="true" />}
            />

            <TextField
              name="email"
              type="email"
              label="Email"
              icon={<Mail className="size-4" aria-hidden="true" />}
            />

            <Select
              label="Role"
              value={values.roleId}
              onChange={(e) => setFieldValue("roleId", Number(e.target.value))}
              options={ROLE_OPTIONS.map((r) => ({ value: r.id, label: r.label }))}
            />

            <label className="flex items-center gap-2.5 pt-1 text-sm text-steel-700 dark:text-steel-300">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(e) => setFieldValue("isActive", e.target.checked)}
                className="size-4 rounded border-steel-300 text-steel-800 focus:ring-amber-400 dark:border-steel-600"
              />
              Account active
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
