import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Department name is required.").max(100),

  code: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .transform((value) => value.toUpperCase()),

  description: z.string().trim().max(500).optional(),

  managerId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid manager id.")
    .optional(),
});
