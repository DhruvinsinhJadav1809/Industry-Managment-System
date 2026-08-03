import { model, Schema } from "mongoose";
import { ISupplier } from "../types/supplier.types";

const SupplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    contactPerson: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,

    isActive: {
      type: Boolean,
      default: true,
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

SupplierSchema.index({ code: 1 }, { unique: true });
SupplierSchema.index({ email: 1 }, { unique: true, sparse: true });
SupplierSchema.index({ name: 1 });

export default model<ISupplier>("Supplier", SupplierSchema);
