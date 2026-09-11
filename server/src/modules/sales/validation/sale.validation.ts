import { z } from "zod";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";

const saleItemSchema = z.object({
  productId: objectIdSchema,

  quantity: z.number().positive("Quantity must be greater than 0."),

  rate: z.number().nonnegative("Rate cannot be negative."),

  gstPercentage: z
    .number()
    .min(0, "GST percentage cannot be negative.")
    .max(100, "GST percentage cannot exceed 100."),
});

export const createSaleSchema = z.object({
  saleDate: z.coerce.date(),

  customerName: z.string().trim().min(1, "Customer name is required."),

  customerPhone: z.string().trim().optional(),

  items: z.array(saleItemSchema).min(1, "Sale must contain at least one item."),

  discountAmount: z
    .number()
    .nonnegative("Discount cannot be negative.")
    .optional(),

  paymentMethod: z.enum(["CASH", "BANK", "UPI", "CARD"], {
    message: "Invalid payment method.",
  }),

  paymentStatus: z
    .enum(["PAID", "PARTIAL", "PENDING"], {
      message: "Invalid payment status.",
    })
    .optional(),

  notes: z.string().trim().optional(),
});

export const getSalesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),

  pageSize: z.coerce.number().int().positive().optional(),

  search: z.string().trim().optional(),

  sortBy: z.string().trim().optional(),

  sortOrder: z.enum(["asc", "desc"]).optional(),

  status: z.string().trim().optional(),
});
