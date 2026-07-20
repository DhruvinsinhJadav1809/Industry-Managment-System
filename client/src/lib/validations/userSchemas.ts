import { z } from "zod";

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(3, "Full name must be at least 3 characters")
    .max(60, "Full name must be under 60 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  roleId: z.number({ message: "Select a role" }),
  isActive: z.boolean(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
