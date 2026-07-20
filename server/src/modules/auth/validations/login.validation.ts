import { z } from "zod";

export const loginValidation = z.object({
  email: z.email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});
