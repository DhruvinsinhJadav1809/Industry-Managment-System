import { model, Schema } from "mongoose";
import { IStaffRoomDocument, StaffRoomStatus } from "../types/staff-room.types";

const staffRoomSchema = new Schema<IStaffRoomDocument>(
  {
    roomNumber: { type: String, required: true, trim: true, uppercase: true },
    floor: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    allocatedCount: { type: Number, required: true, default: 0, min: 0 },
    status: {
      type: String,
      enum: Object.values(StaffRoomStatus),
      default: StaffRoomStatus.ACTIVE,
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

staffRoomSchema.index(
  { roomNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
staffRoomSchema.index({ isDeleted: 1, status: 1 });

export const StaffRoomModel = model<IStaffRoomDocument>(
  "StaffRoom",
  staffRoomSchema,
);
