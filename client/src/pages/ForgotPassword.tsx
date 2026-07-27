import { Formik, Form } from "formik";
import { Mail, MailCheck, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, AuthLayout, Button, TextField } from "../components/common";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../lib/validations/authSchemas";
import { zodToFormikValidate } from "../lib/validations/zodFormik";
import { authService } from "../services/authService";
import type { ApiErrorShape } from "../lib/axios";

const initialValues: ForgotPasswordFormValues = { email: "" };

export default function ForgotPassword() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (
    values: ForgotPasswordFormValues,
    helpers: { setSubmitting: (v: boolean) => void },
  ) => {
    setApiError(null);
    try {
      await authService.forgotPassword(values);
      setSentTo(values.email);
    } catch (err) {
      setApiError((err as ApiErrorShape).message);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="Enter the email on your account and we'll send you a link to reset it."
      footer={
        <span className="text-steel-500 dark:text-steel-400">
          Remembered it after all?{" "}
          <Link
            to="/login"
            className="font-semibold text-steel-800 underline-offset-4 hover:underline dark:text-amber-400"
          >
            Back to sign in
          </Link>
        </span>
      }
    >
      {sentTo ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <MailCheck
            className="size-10 text-signal-500 dark:text-signal-400"
            aria-hidden="true"
          />
          <div>
            <p className="font-display text-lg font-semibold text-steel-900 dark:text-steel-50">
              Check your email
            </p>
            <p className="mt-1 max-w-xs text-sm text-steel-500 dark:text-steel-400">
              If an account exists for <strong>{sentTo}</strong>, a reset link
              is on its way. It expires in 15 minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="mt-2 cursor-pointer text-xs font-medium text-steel-500 underline-offset-4 hover:text-steel-800 hover:underline dark:text-steel-400 dark:hover:text-amber-400"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <Formik
          initialValues={initialValues}
          validate={zodToFormikValidate(forgotPasswordSchema)}
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

              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                icon={<SendHorizonal className="size-4" aria-hidden="true" />}
                className="mt-1"
              >
                Send reset link
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </AuthLayout>
  );
}
