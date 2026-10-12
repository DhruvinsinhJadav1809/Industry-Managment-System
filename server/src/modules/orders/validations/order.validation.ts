import { z } from "zod";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";

const orderItemsSchema = z
  .array(
    z.object({
      productId: objectIdSchema,
      quantity: z.number().int().positive(),
    }),
  )
  .min(1)
  .refine(
    (items) =>
      new Set(items.map((item) => item.productId)).size === items.length,
    "Each product can only appear once in an order.",
  );

export const createOrderSchema = z.object({
  items: orderItemsSchema,
});

export const updateOrderSchema = z
  .object({
    action: z.enum(["modify", "cancel"]),
    items: orderItemsSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.action === "modify" && !value.items) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "Items are required when modifying an order.",
      });
    }
    if (value.action === "cancel" && value.items) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "Items cannot be provided when cancelling an order.",
      });
    }
  });

export const acceptOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: objectIdSchema,
        approvedQuantity: z.number().int().nonnegative(),
      }),
    )
    .min(1)
    .refine(
      (items) =>
        new Set(items.map((item) => item.productId)).size === items.length,
      "Each product can only appear once.",
    ),
});

export const orderIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const getOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "orderNumber", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(["PENDING", "APPROVED", "BILLED", "CANCELLED"]).optional(),
});
