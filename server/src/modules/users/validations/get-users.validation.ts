import { z } from "zod";

export const getUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().optional(),

  roleId: z.coerce.number().optional(),

  sortBy: z.enum(["fullName", "email", "createdAt"]).default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
