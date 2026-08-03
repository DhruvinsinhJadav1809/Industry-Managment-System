import { z } from "zod";

export const updateInventorySchema = z.object({
  minimumStock: z.number().min(0).optional(),

  maximumStock: z.number().min(0).nullable().optional(),

  location: z
    .string()
    .trim()
    .max(100, "Location cannot exceed 100 characters.")
    .optional(),
});
