import { StaffAttendanceStatus } from "../constant/staff-attendance.constant";

export interface UpsertStaffAttendanceDto {
  date: Date;
  status: StaffAttendanceStatus;
  nightShift: boolean;
  overtimeHours: number;
}

export interface StaffAttendancePeriodQueryDto {
  month: number;
  year: number;
}

export interface StaffAttendanceDailyQueryDto {
  date: Date;
}

export interface StaffAttendanceBatchItemDto {
  staffId: string;
  status: StaffAttendanceStatus;
  nightShift: boolean;
  overtimeHours: number;
}

export interface UpsertStaffAttendanceBatchDto {
  date: Date;
  records: StaffAttendanceBatchItemDto[];
}
