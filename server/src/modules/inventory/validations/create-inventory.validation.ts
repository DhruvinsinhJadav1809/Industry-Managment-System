import { z } from "zod";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";

export const createInventorySchema = z.object({
  productId: objectIdSchema,

  quantity: z.number().min(0).optional(),

  minimumStock: z.number().min(0),

  maximumStock: z.number().min(0).optional(),

  location: z
    .string()
    .trim()
    .max(100, "Location cannot exceed 100 characters.")
    .optional(),
});
