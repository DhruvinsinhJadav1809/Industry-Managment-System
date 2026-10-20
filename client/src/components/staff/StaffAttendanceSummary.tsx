import type { StaffAttendanceSummary as AttendanceSummary } from "../../types/staff";
import { STAFF_ATTENDANCE_STATUS_STYLES } from "../../constants/staffAttendance";
import { CalendarDays, Timer } from "lucide-react";

interface Metric {
  label: string;
  value: number;
  style: string;
  valueStyle: string;
  icon: (typeof STAFF_ATTENDANCE_STATUS_STYLES)[keyof typeof STAFF_ATTENDANCE_STATUS_STYLES]["icon"];
}

function MetricTile({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return (
    <div className={`rounded-md border px-3 py-2.5 ${metric.style}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-xs font-semibold ${metric.valueStyle}`}>
            {metric.label}
          </p>
          <p
            className={`mt-1 font-display text-xl font-bold ${metric.valueStyle}`}
          >
            {metric.value}
          </p>
        </div>
        <Icon
          className={`size-5 shrink-0 ${metric.valueStyle}`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export function StaffAttendanceSummary({
  summary,
}: {
  summary: AttendanceSummary;
}) {
  const daysInMonth = new Date(summary.year, summary.month, 0).getDate();
  const attendancePercent = Math.min(
    100,
    (summary.attendanceDays / daysInMonth) * 100,
  );
  const presentMetrics: Metric[] = [
    {
      label: "Present",
      value: summary.presentDays,
      style: STAFF_ATTENDANCE_STATUS_STYLES.PRESENT.tile,
      valueStyle: STAFF_ATTENDANCE_STATUS_STYLES.PRESENT.value,
      icon: STAFF_ATTENDANCE_STATUS_STYLES.PRESENT.icon,
    },
    {
      label: "Half day",
      value: summary.halfDays,
      style: STAFF_ATTENDANCE_STATUS_STYLES.HALF_DAY.tile,
      valueStyle: STAFF_ATTENDANCE_STATUS_STYLES.HALF_DAY.value,
      icon: STAFF_ATTENDANCE_STATUS_STYLES.HALF_DAY.icon,
    },
    {
      label: "Night shift",
      value: summary.nightShifts,
      style: STAFF_ATTENDANCE_STATUS_STYLES.NIGHT_SHIFT.tile,
      valueStyle: STAFF_ATTENDANCE_STATUS_STYLES.NIGHT_SHIFT.value,
      icon: STAFF_ATTENDANCE_STATUS_STYLES.NIGHT_SHIFT.icon,
    },
    {
      label: "OT days / hours",
      value: summary.overtimeDays,
      style: STAFF_ATTENDANCE_STATUS_STYLES.OVERTIME.tile,
      valueStyle: STAFF_ATTENDANCE_STATUS_STYLES.OVERTIME.value,
      icon: STAFF_ATTENDANCE_STATUS_STYLES.OVERTIME.icon,
    },
  ];
  const absenceMetrics: Metric[] = [
    {
      label: "Absent",
      value: summary.absentDays,
      style: STAFF_ATTENDANCE_STATUS_STYLES.ABSENT.tile,
      valueStyle: STAFF_ATTENDANCE_STATUS_STYLES.ABSENT.value,
      icon: STAFF_ATTENDANCE_STATUS_STYLES.ABSENT.icon,
    },
    {
      label: "Week off",
      value: summary.weekOffs,
      style: STAFF_ATTENDANCE_STATUS_STYLES.WEEK_OFF.tile,
      valueStyle: STAFF_ATTENDANCE_STATUS_STYLES.WEEK_OFF.value,
      icon: STAFF_ATTENDANCE_STATUS_STYLES.WEEK_OFF.icon,
    },
    {
      label: "Festival leave",
      value: summary.festivalLeaves,
      style: STAFF_ATTENDANCE_STATUS_STYLES.FESTIVAL_LEAVE.tile,
      valueStyle: STAFF_ATTENDANCE_STATUS_STYLES.FESTIVAL_LEAVE.value,
      icon: STAFF_ATTENDANCE_STATUS_STYLES.FESTIVAL_LEAVE.icon,
    },
  ];

  return (
    <section
      aria-label="Monthly attendance summary"
      className="grid gap-4 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,2fr)]"
    >
      <div className="flex min-h-48 flex-col justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/70">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-200">
              <CalendarDays className="size-4" aria-hidden="true" />
              Attendance days
            </p>
            <p className="mt-3 flex items-baseline gap-2 font-display text-4xl font-bold text-emerald-950 dark:text-white">
              {summary.attendanceDays}
              <span className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                / {daysInMonth}
              </span>
            </p>
          </div>
          <span className="rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-xs font-bold text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900 dark:text-white">
            {Math.round(attendancePercent)}%
          </span>
        </div>
        <div>
          <div
            className="h-2 overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-900"
            role="progressbar"
            aria-label="Attendance days in month"
            aria-valuemin={0}
            aria-valuemax={daysInMonth}
            aria-valuenow={Math.min(summary.attendanceDays, daysInMonth)}
          >
            <div
              className="h-full rounded-full bg-emerald-700 transition-[width] dark:bg-emerald-300"
              style={{ width: `${attendancePercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-emerald-900 dark:text-emerald-200">
            Weighted total; half days count as 0.5. OT and night shifts are
            shown separately.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <h2 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-steel-500 dark:text-steel-400">
            Present and additional shifts
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {presentMetrics.map((metric) => (
              <MetricTile key={metric.label} metric={metric} />
            ))}
          </div>
          <p className="mt-1.5 flex items-center justify-end gap-1.5 text-right text-xs font-medium text-teal-800 dark:text-teal-200">
            <Timer className="size-3.5" aria-hidden="true" />
            Overtime hours: {summary.overtimeHours}
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-steel-500 dark:text-steel-400">
            Absence and leave
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {absenceMetrics.map((metric) => (
              <MetricTile key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
