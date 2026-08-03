import { z } from "zod";

export const createSettingsSchema = z.object({
  companyName: z.string().trim().min(2),

  gstNumber: z.string().trim().min(5),

  email: z.email().optional(),

  phone: z.string().optional(),

  address: z.string().optional(),

  city: z.string().optional(),

  state: z.string().optional(),

  country: z.string().optional(),

  postalCode: z.string().optional(),
});
