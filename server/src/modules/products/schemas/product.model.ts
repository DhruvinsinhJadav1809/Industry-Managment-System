import { Schema, model, Types } from "mongoose";
import { IProductDocument, ProductUnit } from "../types/product.types";

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    productCode: { type: String, required: true, trim: true, uppercase: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    unit: {
      type: String,
      enum: Object.values(ProductUnit),
      required: true,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
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
    },

    deletedBy: {
      type: Types.ObjectId,
      ref: "User",
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);
productSchema.index(
  {
    sku: 1,
  },
  {
    unique: true,
  },
);

productSchema.index({
  name: 1,
});

productSchema.index({
  departmentId: 1,
});

productSchema.index({
  isDeleted: 1,
});

export const ProductModel = model<IProductDocument>("Product", productSchema);
