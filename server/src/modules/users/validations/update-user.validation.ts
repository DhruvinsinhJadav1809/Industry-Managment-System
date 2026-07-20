import { z } from "zod";

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .transform((email) => email.toLowerCase()),

  roleId: z.number().int().positive("Role is required."),

  imageUrl: z
    .string()
    .trim()
    .url("Please provide a valid image URL.")
    .optional(),

  isActive: z.boolean(),
});
