import { Schema, model } from "mongoose";
import { IPurchaseDocument } from "../types/purchase.types";
import { PurchaseStatus } from "../constants/purchase-status.enum";

const purchaseSchema = new Schema<IPurchaseDocument>(
  {
    purchaseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    invoiceNumber: {
      type: String,
      trim: true,
    },

    purchaseDate: {
      type: Date,
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(PurchaseStatus),
      default: PurchaseStatus.Completed,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);

purchaseSchema.index({ supplierId: 1 });

purchaseSchema.index({ purchaseDate: -1 });

purchaseSchema.index({ status: 1 });

purchaseSchema.index({ isDeleted: 1 });

export const PurchaseModel = model<IPurchaseDocument>(
  "Purchase",
  purchaseSchema,
);
