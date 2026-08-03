import { z } from "zod";

export const supplierSchema = z.object({
  name: z
    .string()
    .min(1, "Supplier name is required")
    .max(120, "Name must be under 120 characters"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be under 20 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
  contactPerson: z
    .string()
    .min(1, "Contact person is required")
    .max(80, "Name must be under 80 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9+\-\s()]{7,15}$/, "Enter a valid phone number"),
  gstNumber: z
    .string()
    .min(1, "GST number is required")
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
      "Enter a valid 15-character GSTIN (e.g. 24ABCDE1234F1Z5)"
    ),
  address: z.string().min(1, "Address is required").max(200, "Address must be under 200 characters"),
  city: z.string().min(1, "City is required").max(60, "City must be under 60 characters"),
  state: z.string().min(1, "State is required").max(60, "State must be under 60 characters"),
  country: z.string().min(1, "Country is required").max(60, "Country must be under 60 characters"),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .regex(/^[0-9]{4,10}$/, "Enter a valid postal code"),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

export const editSupplierSchema = supplierSchema.extend({
  isActive: z.boolean(),
});

export type EditSupplierFormValues = z.infer<typeof editSupplierSchema>;
