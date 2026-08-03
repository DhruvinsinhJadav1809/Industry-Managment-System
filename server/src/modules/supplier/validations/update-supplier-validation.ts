import { z } from "zod";

export const updateSupplierSchema = z.object({
  name: z.string().trim().min(2).optional(),

  code: z.string().trim().min(2).optional(),

  contactPerson: z.string().optional(),

  email: z.email().optional(),

  phone: z.string().optional(),

  gstNumber: z.string().optional(),

  address: z.string().optional(),

  city: z.string().optional(),

  state: z.string().optional(),

  country: z.string().optional(),

  postalCode: z.string().optional(),

  isActive: z.boolean().optional(),
});
