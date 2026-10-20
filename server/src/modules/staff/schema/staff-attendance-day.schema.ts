import { model, Schema, Types } from "mongoose";

interface IStaffAttendanceDay {
  date: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const staffAttendanceDaySchema = new Schema<IStaffAttendanceDay>(
  {
    date: { type: Date, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default model<IStaffAttendanceDay>(
  "StaffAttendanceDay",
  staffAttendanceDaySchema,
);
