import { z } from "zod";

export const settingsSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(120, "Name must be under 120 characters"),
  gstNumber: z
    .string()
    .min(1, "GST number is required")
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
      "Enter a valid 15-character GSTIN (e.g. 24ABCDE1234F1Z5)",
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9+\-\s()]{7,15}$/, "Enter a valid phone number"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must be under 200 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(60, "City must be under 60 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .max(60, "State must be under 60 characters"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(60, "Country must be under 60 characters"),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .regex(/^[0-9]{4,10}$/, "Enter a valid postal code"),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
