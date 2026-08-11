import { Schema, model } from "mongoose";
import { IPurchaseItemDocument } from "../types/purchase-item.types";

const purchaseItemSchema = new Schema<IPurchaseItemDocument>(
  {
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

purchaseItemSchema.index({ purchaseId: 1 });

purchaseItemSchema.index({ productId: 1 });

export const PurchaseItemModel = model<IPurchaseItemDocument>(
  "PurchaseItem",
  purchaseItemSchema,
);
