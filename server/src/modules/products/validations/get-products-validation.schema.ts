import { z } from "zod";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";
export const getProductsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),

  pageSize: z.coerce.number().min(1).max(100).default(10),

  search: z.string().trim().optional(),

  departmentId: objectIdSchema.optional(),

  isActive: z.coerce.boolean().optional(),

  sortBy: z
    .enum(["name", "sku", "costPrice", "sellingPrice", "createdAt"])
    .default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
