import { Schema, model, Types } from "mongoose";
import { IInventoryDocument } from "../types/inventory.types";

const inventorySchema = new Schema<IInventoryDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    minimumStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    maximumStock: {
      type: Number,
      default: null,
      min: 0,
    },

    location: {
      type: String,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedBy: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const InventoryModel = model<IInventoryDocument>(
  "Inventory",
  inventorySchema,
);
