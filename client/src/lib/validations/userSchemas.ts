import { z } from "zod";

export const inviteUserDetailsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be 100 characters or fewer"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(254, "Email must be 254 characters or fewer")
    .email("Enter a valid email address"),
});

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(3, "Full name must be at least 3 characters")
    .max(60, "Full name must be under 60 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  roleId: z.number({ message: "Select a role" }),
  isActive: z.boolean(),
  monthlySalary: z.coerce
    .number()
    .min(0, "Salary must be 0 or more")
    .optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
