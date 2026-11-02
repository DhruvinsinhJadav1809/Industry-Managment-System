import { model, Schema } from "mongoose";
import { IEmployeeAsset } from "./employee-asset.types";

const assignmentSchema = new Schema(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    assignedAt: { type: Date, required: true, default: Date.now },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false },
);

const releaseRequestSchema = new Schema(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    staffName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      required: true,
      default: "PENDING",
    },
    createdAt: { type: Date, required: true, default: Date.now },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedByName: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: false },
);

const employeeAssetSchema = new Schema<IEmployeeAsset>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    quantity: { type: Number, required: true, min: 1 },
    assignments: { type: [assignmentSchema], default: [] },
    releaseRequests: { type: [releaseRequestSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

employeeAssetSchema.index({ isDeleted: 1, name: 1 });

export default model<IEmployeeAsset>("EmployeeAsset", employeeAssetSchema);
