import { StaffAttendanceStatus } from "../constant/staff-attendance.constant";

export interface StaffAttendanceResponseDto {
  id: string;
  staffId: string;
  date: string;
  status: StaffAttendanceStatus;
  nightShift: boolean;
  overtimeHours: number;
}

export interface StaffAttendanceSummaryDto {
  month: number;
  year: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  attendanceDays: number;
  weekOffs: number;
  festivalLeaves: number;
  nightShifts: number;
  overtimeDays: number;
  overtimeHours: number;
}

export interface StaffAttendanceMonthDto {
  records: StaffAttendanceResponseDto[];
  summary: StaffAttendanceSummaryDto;
}

export interface StaffAttendanceDailyDto {
  records: StaffAttendanceResponseDto[];
  submitted: boolean;
}
