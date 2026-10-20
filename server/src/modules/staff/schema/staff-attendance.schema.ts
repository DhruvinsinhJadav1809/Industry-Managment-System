import { model, Schema } from "mongoose";
import { STAFF_ATTENDANCE_STATUSES } from "../constant/staff-attendance.constant";
import { IStaffAttendanceDocument } from "../types/staff-attendance.types";

const staffAttendanceSchema = new Schema<IStaffAttendanceDocument>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: STAFF_ATTENDANCE_STATUSES,
      required: true,
    },
    nightShift: { type: Boolean, default: false },
    overtimeHours: { type: Number, min: 0, max: 24, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

staffAttendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

export default model<IStaffAttendanceDocument>(
  "StaffAttendance",
  staffAttendanceSchema,
);
