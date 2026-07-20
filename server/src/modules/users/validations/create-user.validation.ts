import { z } from "zod";

const createUserValidation = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters.")
    .max(100, "Full name cannot exceed 100 characters."),

  email: z.email("Please provide a valid email address."),

  password: z
    .string()
    .min(6, "Password must be at least 8 characters.")
    .max(20, "Password cannot exceed 20 characters."),

  imageUrl: z.url().optional(),
});

export default createUserValidation;
