import { HydratedDocument, Types } from "mongoose";
import { StaffAttendanceStatus } from "../constant/staff-attendance.constant";

export interface IStaffAttendance {
  staffId: Types.ObjectId;
  date: Date;
  status: StaffAttendanceStatus;
  nightShift: boolean;
  overtimeHours: number;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IStaffAttendanceDocument = HydratedDocument<IStaffAttendance>;
