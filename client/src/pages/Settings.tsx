import { Formik, Form } from "formik";
import {
  Building2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, Button, TextField } from "../components/common";
import { LogoUploader } from "../components/settings/LogoUploader";
import { AppLayout } from "../layouts/AppLayout";
import { useToast } from "../context/ToastContext";
import {
  settingsSchema,
  type SettingsFormValues,
} from "../lib/validations/settingsSchemas";
import { zodToFormikValidate } from "../lib/validations/zodFormik";
import { settingsService } from "../services/settingsService";
import type { ApiErrorShape } from "../lib/axios";
import type { CompanySettings } from "../types/settings";
import { useCompanySettings } from "../context/CompanySettingsContext";
const blankValues: SettingsFormValues = {
  companyName: "",
  gstNumber: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
};

export default function Settings() {
  const toast = useToast();
  const { setSettings: setGlobalSettings } = useCompanySettings();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  // "unknown" while loading, then "create" (no settings saved yet) or "edit".
  const [mode, setMode] = useState<"unknown" | "create" | "edit">("unknown");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    settingsService
      .get()
      .then((res) => {
        if (cancelled) return;
        setSettings(res.data);
        setMode("edit");
      })
      .catch((err) => {
        if (cancelled) return;
        const apiErr = err as ApiErrorShape;
        if (apiErr.status === 404) {
          // No settings saved yet — show the setup form instead of an error.
          setMode("create");
        } else {
          setLoadError(apiErr.message);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (
    values: SettingsFormValues,
    helpers: {
      setSubmitting: (v: boolean) => void;
      setErrors: (errors: Record<string, string>) => void;
    },
  ) => {
    setApiError(null);
    try {
      const res =
        mode === "create"
          ? await settingsService.create(values)
          : await settingsService.update(values);
      setSettings(res.data);
      setGlobalSettings(res.data);
      setMode("edit");
      toast.success(
        mode === "create" ? "Settings created." : "Settings updated.",
      );
    } catch (err) {
      const apiErr = err as ApiErrorShape;
      setApiError(apiErr.message);
      if (apiErr.fieldErrors) helpers.setErrors(apiErr.fieldErrors);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const initialValues: SettingsFormValues = settings
    ? {
        companyName: settings.companyName,
        gstNumber: settings.gstNumber,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        city: settings.city,
        state: settings.state,
        country: settings.country,
        postalCode: settings.postalCode,
      }
    : blankValues;

  return (
    <AppLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
          <SettingsIcon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-steel-900 dark:text-steel-50">
            Company settings
          </h1>
          <p className="text-sm text-steel-500 dark:text-steel-400">
            {mode === "create"
              ? "Set up your company profile — this only needs to be done once."
              : "Company profile used across invoices and documents."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-steel-500 dark:text-steel-400">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading settings…
        </div>
      ) : loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : (
        <div className="corner-frame max-w-2xl rounded-lg border border-steel-200 bg-white/70 p-8 dark:border-steel-800 dark:bg-steel-900/40">
          {mode === "edit" && (
            <div className="mb-8">
              <p className="mb-3 font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
                Company logo
              </p>
              <LogoUploader
                logoUrl={settings?.logoUrl ?? null}
                onUploaded={(logoUrl) =>
                  setSettings((prev) => {
                    if (!prev) return prev;
                    const next = { ...prev, logoUrl };
                    setGlobalSettings(next);
                    return next;
                  })
                }
              />
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validate={zodToFormikValidate(settingsSchema)}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form noValidate className="flex flex-col gap-4">
                {apiError && <Alert variant="error">{apiError}</Alert>}

                <TextField
                  name="companyName"
                  label="Company name"
                  placeholder="ABC Handle Industries"
                  icon={<Building2 className="size-4" aria-hidden="true" />}
                />

                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="info@abchandle.com"
                    icon={<Mail className="size-4" aria-hidden="true" />}
                  />
                  <TextField
                    name="phone"
                    label="Phone"
                    placeholder="9876543210"
                    icon={<Phone className="size-4" aria-hidden="true" />}
                  />
                </div>

                <TextField
                  name="gstNumber"
                  label="GST number"
                  placeholder="24ABCDE1234F1Z5"
                  hint="15-character GSTIN"
                  onChange={(e) =>
                    setFieldValue("gstNumber", e.target.value.toUpperCase())
                  }
                />

                <TextField
                  name="address"
                  label="Address"
                  placeholder="SG Highway"
                  icon={<MapPin className="size-4" aria-hidden="true" />}
                />

                <div className="grid grid-cols-2 gap-4">
                  <TextField name="city" label="City" placeholder="Ahmedabad" />
                  <TextField name="state" label="State" placeholder="Gujarat" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    name="country"
                    label="Country"
                    placeholder="India"
                  />
                  <TextField
                    name="postalCode"
                    label="Postal code"
                    placeholder="380015"
                  />
                </div>

                <div className="mt-2 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    icon={<Save className="size-4" aria-hidden="true" />}
                  >
                    {mode === "create" ? "Save settings" : "Save changes"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </AppLayout>
  );
}
