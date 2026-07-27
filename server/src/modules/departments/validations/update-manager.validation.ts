import { z } from "zod";

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Department name must be at least 2 characters.")
    .max(100, "Department name cannot exceed 100 characters."),

  code: z
    .string()
    .trim()
    .min(2, "Department code must be at least 2 characters.")
    .max(10, "Department code cannot exceed 10 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional(),

  isActive: z.boolean(),
});

export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;
