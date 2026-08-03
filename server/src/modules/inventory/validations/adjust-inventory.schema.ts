import { z } from "zod";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";

export const adjustInventorySchema = z.object({
  productId: objectIdSchema,

  type: z.enum(["IN", "OUT"]),

  quantity: z.number().positive("Quantity must be greater than zero."),

  reason: z.string().trim().min(3).max(250),
});
