import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, "Department name is required")
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be under 60 characters"),
  code: z
    .string()
    .min(1, "Code is required")
    .min(2, "Code must be at least 2 characters")
    .max(10, "Code must be under 10 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be under 300 characters"),
  managerId: z.string().optional(),
});

export type CreateDepartmentFormValues = z.infer<typeof createDepartmentSchema>;

/**
 * Same field rules as create, minus managerId (handled by the separate
 * assign-manager endpoint) and plus isActive.
 */
export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, "Department name is required")
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be under 60 characters"),
  code: z
    .string()
    .min(1, "Code is required")
    .min(2, "Code must be at least 2 characters")
    .max(10, "Code must be under 10 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be under 300 characters"),
  isActive: z.boolean(),
});

export type UpdateDepartmentFormValues = z.infer<typeof updateDepartmentSchema>;

export const assignManagerSchema = z.object({
  managerId: z.string().min(1, "Select a manager"),
});

export type AssignManagerFormValues = z.infer<typeof assignManagerSchema>;
