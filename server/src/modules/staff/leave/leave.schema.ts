import { model, Schema } from "mongoose";
import {
  IStaffLeaveRequest,
  STAFF_LEAVE_TYPES,
  STAFF_LEAVE_STATUSES,
} from "./leave.types";

const staffLeaveRequestSchema = new Schema<IStaffLeaveRequest>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    staffName: { type: String, required: true, trim: true },
    leaveType: {
      type: String,
      enum: STAFF_LEAVE_TYPES,
      required: true,
      default: "FULL_DAY",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: STAFF_LEAVE_STATUSES,
      required: true,
      default: "PENDING",
    },
    reviewReason: { type: String, trim: true, maxlength: 1000, default: null },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedByName: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

staffLeaveRequestSchema.index({ staffId: 1, createdAt: -1 });
staffLeaveRequestSchema.index({ createdAt: -1 });

export default model<IStaffLeaveRequest>(
  "StaffLeaveRequest",
  staffLeaveRequestSchema,
);
