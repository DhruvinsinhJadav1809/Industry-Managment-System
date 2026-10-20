export const STAFF_ATTENDANCE_STATUSES = [
  "PRESENT",
  "ABSENT",
  "HALF_DAY",
  "NIGHT_SHIFT",
  "OVERTIME",
  "WEEK_OFF",
  "FESTIVAL_LEAVE",
] as const;

export type StaffAttendanceStatus = (typeof STAFF_ATTENDANCE_STATUSES)[number];
