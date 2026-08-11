import { z } from "zod";

export const createPurchaseSchema = z.object({
  supplierId: z.string(),

  invoiceNumber: z.string().optional(),

  purchaseDate: z.coerce.date(),

  remarks: z.string().optional(),

  discount: z.number().min(0).default(0),

  items: z
    .array(
      z.object({
        productId: z.string(),

        quantity: z.number().positive(),

        unitPrice: z.number().positive(),

        taxPercentage: z.number().min(0),
      }),
    )
    .min(1),
});
