import { model, Schema } from "mongoose";
import { IStaffRoomAllocationDocument } from "../types/staff-room.types";

const staffRoomAllocationSchema = new Schema<IStaffRoomAllocationDocument>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "StaffRoom",
      required: true,
    },
    staffId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    allocatedAt: { type: Date, required: true, default: Date.now },
    vacatedAt: { type: Date, default: null },
    isActive: { type: Boolean, required: true, default: true },
    allocatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vacatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

staffRoomAllocationSchema.index(
  { staffId: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);
staffRoomAllocationSchema.index({ roomId: 1, isActive: 1 });
staffRoomAllocationSchema.index({ staffId: 1, allocatedAt: -1 });

export const StaffRoomAllocationModel = model<IStaffRoomAllocationDocument>(
  "StaffRoomAllocation",
  staffRoomAllocationSchema,
);
