import { z } from "zod";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";
import { ProductUnit } from "../types/product.types";

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(2).max(100),

    sku: z.string().trim().min(2).max(50),
    productCode: z.string().trim().min(2).max(50),
    departmentId: objectIdSchema,

    description: z.string().trim().max(500).optional(),

    unit: z.nativeEnum(ProductUnit),

    costPrice: z.number().min(0),

    sellingPrice: z.number().min(0),

    isActive: z.boolean(),
  })
  .refine((data) => data.sellingPrice >= data.costPrice, {
    message: "Selling price must be greater than or equal to cost price.",
    path: ["sellingPrice"],
  });
