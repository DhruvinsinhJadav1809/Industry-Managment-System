import { z } from "zod";

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  productLabel: z.string().optional(), // display-only, not sent to the API
  quantity: z.coerce
    .number({ message: "Enter a quantity" })
    .positive("Quantity must be greater than 0"),
  unitPrice: z.coerce
    .number({ message: "Enter a unit price" })
    .positive("Unit price must be greater than 0"),
  taxPercentage: z.coerce
    .number({ message: "Enter a tax percentage" })
    .min(0, "Tax can't be negative")
    .max(100, "Tax can't exceed 100%"),
});

export type PurchaseItemFormValues = z.infer<typeof purchaseItemSchema>;

export const createPurchaseSchema = z.object({
  supplierId: z.string().min(1, "Select a supplier"),
  invoiceNumber: z
    .string()
    .min(1, "Invoice number is required")
    .max(60, "Invoice number must be under 60 characters"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  remarks: z
    .string()
    .max(300, "Remarks must be under 300 characters")
    .optional(),
  discount: z.coerce.number().min(0, "Discount can't be negative"),
  items: z.array(purchaseItemSchema).min(1, "Add at least one item"),
});

export type CreatePurchaseFormValues = z.infer<typeof createPurchaseSchema>;
