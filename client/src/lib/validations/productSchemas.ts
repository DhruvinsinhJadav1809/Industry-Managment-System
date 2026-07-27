import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(120, "Name must be under 120 characters"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(40, "SKU must be under 40 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
  productCode: z
    .string()
    .min(1, "Product code is required")
    .max(40, "Product code must be under 40 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
  departmentId: z.string().min(1, "Select a department"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be under 300 characters"),
  unit: z.string().min(1, "Select a unit"),
  costPrice: z.coerce
    .number({ message: "Enter a valid cost price" })
    .positive("Cost price must be greater than 0"),
  sellingPrice: z.coerce
    .number({ message: "Enter a valid selling price" })
    .positive("Selling price must be greater than 0"),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(120, "Name must be under 120 characters"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(40, "SKU must be under 40 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
  productCode: z
    .string()
    .min(1, "Product code is required")
    .max(40, "Product code must be under 40 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
  departmentId: z.string().min(1, "Select a department"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be under 300 characters"),
  unit: z.string().min(1, "Select a unit"),
  costPrice: z.coerce
    .number({ message: "Enter a valid cost price" })
    .positive("Cost price must be greater than 0"),
  sellingPrice: z.coerce
    .number({ message: "Enter a valid selling price" })
    .positive("Selling price must be greater than 0"),
  isActive: z.boolean(),
});

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;
