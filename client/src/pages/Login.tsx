import { Formik, Form } from "formik";
import { LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  AuthLayout,
  Button,
  PasswordField,
  TextField,
} from "../components/common";
import {
  loginSchema,
  type LoginFormValues,
} from "../lib/validations/authSchemas";
import { zodToFormikValidate } from "../lib/validations/zodFormik";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import type { ApiErrorShape } from "../lib/axios";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  // Arrives here after a fresh registration, so the email is pre-filled.
  const registeredEmail =
    (location.state as { registeredEmail?: string } | null)
      ?.registeredEmail ?? "";

  // If ProtectedRoute bounced an unauthenticated visit here, send them
  // back to where they were headed once they sign in.
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/";

  const initialValues: LoginFormValues = {
    email: registeredEmail,
    password: "",
  };

  const handleSubmit = async (
    values: LoginFormValues,
    helpers: { setSubmitting: (v: boolean) => void }
  ) => {
    setApiError(null);
    try {
      const res = await authService.login(values);
      const { user, accessToken } = res.data;
      login(user, accessToken);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const apiErr = err as ApiErrorShape;
      setApiError(apiErr.message);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to IMS"
      subtitle="Pick up where you left off — dashboards, crews, and reports are exactly as you set them."
      footer={
        <span className="text-steel-500 dark:text-steel-400">
          New to IMS?{" "}
          <Link
            to="/register"
            className="font-semibold text-steel-800 underline-offset-4 hover:underline dark:text-amber-400"
          >
            Create an account
          </Link>
        </span>
      }
    >
      {registeredEmail && (
        <div className="mb-5">
          <Alert variant="success">
            Account created. Sign in to continue.
          </Alert>
        </div>
      )}

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validate={zodToFormikValidate(loginSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form noValidate className="flex flex-col gap-5">
            {apiError && <Alert variant="error">{apiError}</Alert>}

            <TextField
              name="email"
              type="email"
              label="Work email"
              placeholder="you@company.com"
              icon={<Mail className="size-4" aria-hidden="true" />}
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <PasswordField
                name="password"
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-steel-500 underline-offset-4 hover:text-steel-800 hover:underline dark:text-steel-400 dark:hover:text-amber-400"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              icon={<LogIn className="size-4" aria-hidden="true" />}
              className="mt-1"
            >
              Sign in
            </Button>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
