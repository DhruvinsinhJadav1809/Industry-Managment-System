import { Formik, Form, type FormikHelpers } from "formik";
import { CheckCircle2, Mail, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  AuthLayout,
  Button,
  PasswordField,
  TextField,
} from "../components/common";
import {
  registerSchema,
  type RegisterFormValues,
} from "../lib/validations/authSchemas";
import { zodToFormikValidate } from "../lib/validations/zodFormik";
import { authService } from "../services/authService";
import type { ApiErrorShape } from "../lib/axios";

const initialValues: RegisterFormValues = {
  fullName: "",
  email: "",
  password: "",
};

export default function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [registeredName, setRegisteredName] = useState<string | null>(null);

  const handleSubmit = async (
    values: RegisterFormValues,
    helpers: FormikHelpers<RegisterFormValues>
  ) => {
    setApiError(null);
    try {
      const res = await authService.register(values);
      const created = res.data;

      // No token comes back from this endpoint — the account is created,
      // so send the person to sign in rather than treating this as a login.
      setRegisteredName(created.fullName);
      setTimeout(() => {
        navigate("/login", { state: { registeredEmail: created.email } });
      }, 1400);
    } catch (err) {
      const apiErr = err as ApiErrorShape;
      setApiError(apiErr.message);
      if (apiErr.fieldErrors) {
        helpers.setErrors(apiErr.fieldErrors);
      }
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Set up access to monitor lines, crews, and output across every facility in your network."
      footer={
        <span className="text-steel-500 dark:text-steel-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-steel-800 underline-offset-4 hover:underline dark:text-amber-400"
          >
            Sign in
          </Link>
        </span>
      }
    >
      {registeredName ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2
            className="size-10 text-signal-500 dark:text-signal-400"
            aria-hidden="true"
          />
          <div>
            <p className="font-display text-lg font-semibold text-steel-900 dark:text-steel-50">
              Account created
            </p>
            <p className="mt-1 text-sm text-steel-500 dark:text-steel-400">
              Welcome, {registeredName}. Taking you to sign in…
            </p>
          </div>
        </div>
      ) : (
        <Formik
          initialValues={initialValues}
          validate={zodToFormikValidate(registerSchema)}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form noValidate className="flex flex-col gap-5">
              {apiError && <Alert variant="error">{apiError}</Alert>}

              <TextField
                name="fullName"
                label="Full name"
                placeholder="Dhruvinsinh Jadav"
                icon={<User className="size-4" aria-hidden="true" />}
                autoComplete="name"
              />

              <TextField
                name="email"
                type="email"
                label="Work email"
                placeholder="you@company.com"
                icon={<Mail className="size-4" aria-hidden="true" />}
                autoComplete="email"
              />

              <PasswordField
                name="password"
                label="Password"
                placeholder="Create a strong password"
                showStrength
              />

              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                icon={<UserPlus className="size-4" aria-hidden="true" />}
                className="mt-1"
              >
                Create account
              </Button>

              <p className="text-center text-xs leading-relaxed text-steel-400 dark:text-steel-500">
                By creating an account you agree to the plant access &amp;
                data handling policy.
              </p>
            </Form>
          )}
        </Formik>
      )}
    </AuthLayout>
  );
}
