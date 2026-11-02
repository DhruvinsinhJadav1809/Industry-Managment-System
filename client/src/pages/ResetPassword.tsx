import { Formik, Form } from "formik";
import { KeyRound, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  AuthLayout,
  Button,
  PasswordField,
} from "../components/common";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../lib/validations/authSchemas";
import { zodToFormikValidate } from "../lib/validations/zodFormik";
import { authService } from "../services/authService";
import type { ApiErrorShape } from "../lib/axios";

const initialValues: ResetPasswordFormValues = {
  password: "",
  confirmPassword: "",
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const isActivation = location.pathname === "/set-password";
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (
    values: ResetPasswordFormValues,
    helpers: { setSubmitting: (v: boolean) => void }
  ) => {
    if (!token) return;
    setApiError(null);
    try {
      if (isActivation) {
        await authService.activateAccount({ token, password: values.password });
      } else {
        await authService.resetPassword({ token, password: values.password });
      }
      navigate("/login?passwordReset=1", { replace: true });
    } catch (err) {
      setApiError((err as ApiErrorShape).message);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  // No token in the URL at all — the link is malformed or was opened directly.
  if (!token) {
    return (
      <AuthLayout
        eyebrow={isActivation ? "Account setup" : "Account recovery"}
        title="Link invalid"
        subtitle={`This ${isActivation ? "account setup" : "password reset"} link is missing or malformed.`}
        footer={
          <span className="text-steel-500 dark:text-steel-400">
            <Link
              to="/login"
              className="font-semibold text-steel-800 underline-offset-4 hover:underline dark:text-amber-400"
            >
              Back to sign in
            </Link>
          </span>
        }
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <ShieldAlert
            className="size-10 text-red-500 dark:text-red-400"
            aria-hidden="true"
          />
          <p className="max-w-xs text-sm text-steel-500 dark:text-steel-400">
            {isActivation
              ? "Contact your administrator to request a new invitation."
              : "Request a new link and open it directly from the email."}
          </p>
          {!isActivation && (
            <Link to="/forgot-password" className="mt-2">
              <Button variant="secondary">Request a new link</Button>
            </Link>
          )}
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow={isActivation ? "Account setup" : "Account recovery"}
      title={isActivation ? "Set your password" : "Set a new password"}
      subtitle={
        isActivation
          ? "Choose a password to activate your invited account."
          : "Choose a strong password for your account."
      }
      footer={
        <span className="text-steel-500 dark:text-steel-400">
          <Link
            to="/login"
            className="font-semibold text-steel-800 underline-offset-4 hover:underline dark:text-amber-400"
          >
            Back to sign in
          </Link>
        </span>
      }
    >
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(resetPasswordSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form noValidate className="flex flex-col gap-5">
            {apiError && <Alert variant="error">{apiError}</Alert>}

            <PasswordField
              name="password"
              label="New password"
              placeholder="Create a strong password"
              showStrength
            />

            <PasswordField
              name="confirmPassword"
              label="Confirm new password"
              placeholder="Re-enter your new password"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              icon={<KeyRound className="size-4" aria-hidden="true" />}
              className="mt-1"
            >
              {isActivation ? "Activate account" : "Reset password"}
            </Button>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
