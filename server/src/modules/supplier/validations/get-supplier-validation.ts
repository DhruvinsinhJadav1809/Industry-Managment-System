import { z } from "zod";

export const getSuppliersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),

  pageSize: z.coerce.number().min(1).max(100).default(10),

  search: z.string().optional(),

  sortBy: z.string().default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),

  isActive: z.coerce.boolean().optional(),
});
