import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  productLabel: z.string().optional(), // display-only, not sent to the API
  quantity: z.coerce
    .number({ message: "Enter a quantity" })
    .positive("Quantity must be greater than 0"),
  rate: z.coerce
    .number({ message: "Enter a rate" })
    .positive("Rate must be greater than 0"),
  gstPercentage: z.coerce
    .number({ message: "Enter a GST percentage" })
    .min(0, "GST can't be negative")
    .max(100, "GST can't exceed 100%"),
});

export type SaleItemFormValues = z.infer<typeof saleItemSchema>;

export const createSaleSchema = z.object({
  saleDate: z.string().min(1, "Sale date is required"),
  customerName: z
    .string()
    .min(1, "Customer name is required")
    .max(120, "Name must be under 120 characters"),
  customerPhone: z
    .string()
    .min(1, "Customer phone is required")
    .regex(/^[0-9+\-\s()]{7,15}$/, "Enter a valid phone number"),
  items: z.array(saleItemSchema).min(1, "Add at least one item"),
  discountAmount: z.coerce.number().min(0, "Discount can't be negative"),
  paymentMethod: z.string().min(1, "Select a payment method"),
  paymentStatus: z.string().min(1, "Select a payment status"),
  notes: z.string().max(300, "Notes must be under 300 characters").optional(),
});

export type CreateSaleFormValues = z.infer<typeof createSaleSchema>;
