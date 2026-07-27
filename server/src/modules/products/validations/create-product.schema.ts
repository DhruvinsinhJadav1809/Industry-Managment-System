import { z } from "zod";
import { ProductUnit } from "../types/product.types";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";

export const createProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters.")
      .max(100, "Product name cannot exceed 100 characters."),

    sku: z
      .string()
      .trim()
      .min(2, "SKU must be at least 2 characters.")
      .max(50, "SKU cannot exceed 50 characters."),

    productCode: z
      .string()
      .trim()
      .min(2, "Product code must be at least 2 characters.")
      .max(50, "Product code cannot exceed 50 characters."),

    departmentId: objectIdSchema,

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters.")
      .optional(),

    unit: z.nativeEnum(ProductUnit),

    costPrice: z.number().min(0, "Cost price cannot be negative."),

    sellingPrice: z.number().min(0, "Selling price cannot be negative."),
  })
  .refine((data) => data.sellingPrice >= data.costPrice, {
    message: "Selling price must be greater than or equal to cost price.",
    path: ["sellingPrice"],
  });

export type CreateProductDto = z.infer<typeof createProductSchema>;
