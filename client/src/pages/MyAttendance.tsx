import { CalendarDays, Clock3, MoonStar, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, Select } from "../components/common";
import { StaffAttendanceSummary } from "../components/staff/StaffAttendanceSummary";
import { STAFF_ATTENDANCE_STATUS_STYLES } from "../constants/staffAttendance";
import { MONTH_OPTIONS } from "../constants/staffledger";
import type { ApiErrorShape } from "../lib/axios";
import { AppLayout } from "../layouts/AppLayout";
import { staffService } from "../services/staffservice";
import type {
  StaffAttendanceRecord,
  StaffAttendanceSummary as AttendanceSummary,
} from "../types/staff";

const CURRENT_DATE = new Date();

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${date}T00:00:00`));
}

export default function MyAttendance() {
  const [selectedMonth, setSelectedMonth] = useState(
    CURRENT_DATE.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(CURRENT_DATE.getFullYear());
  const [records, setRecords] = useState<StaffAttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const yearOptions = Array.from(
    { length: 7 },
    (_, index) => CURRENT_DATE.getFullYear() - 3 + index,
  );

  useEffect(() => {
    const loadAttendance = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await staffService.getMyMonthlyAttendance(
          selectedMonth,
          selectedYear,
        );
        setRecords(response.data.records ?? []);
        setSummary(response.data.summary);
      } catch (loadError) {
        setError((loadError as ApiErrorShape).message);
        setRecords([]);
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };
    void loadAttendance();
  }, [selectedMonth, selectedYear]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-steel-800 text-white dark:bg-amber-400 dark:text-steel-950">
            <CalendarDays className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
              My records
            </p>
            <h1 className="font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
              Attendance
            </h1>
          </div>
        </header>

        {error && <Alert variant="error">{error}</Alert>}

        <section className="grid gap-4 rounded-lg border border-steel-200 bg-white p-4 sm:grid-cols-2 dark:border-steel-800 dark:bg-steel-900/80">
          <Select
            label="Month"
            options={MONTH_OPTIONS}
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(Number(event.target.value))}
          />
          <Select
            label="Year"
            options={yearOptions.map((year) => ({
              value: year,
              label: String(year),
            }))}
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
          />
        </section>

        {summary && <StaffAttendanceSummary summary={summary} />}

        <section className="overflow-hidden rounded-lg border border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-900/80">
          <div className="flex items-center justify-between gap-3 border-b border-steel-200 px-4 py-3 dark:border-steel-800">
            <h2 className="font-semibold text-steel-900 dark:text-steel-50">
              Daily attendance
            </h2>
            <div className="flex items-center gap-2 text-xs text-steel-500 dark:text-steel-400">
              <MoonStar className="size-4" aria-hidden="true" /> Night shifts
              <Clock3 className="ml-2 size-4" aria-hidden="true" /> OT hours
            </div>
          </div>
          {isLoading ? (
            <div className="py-12 text-center text-steel-500 dark:text-steel-400">
              Loading monthly attendance...
            </div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-steel-500 dark:text-steel-400">
              No attendance records for this month.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead className="bg-steel-50 text-xs uppercase text-steel-500 dark:bg-steel-950 dark:text-steel-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Attendance type</th>
                    <th className="px-4 py-3 font-semibold">Night shift</th>
                    <th className="px-4 py-3 font-semibold">OT hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-steel-800 dark:text-steel-100">
                        {dateLabel(record.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(() => {
                            const StatusIcon =
                              STAFF_ATTENDANCE_STATUS_STYLES[record.status]
                                .icon;
                            return (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${STAFF_ATTENDANCE_STATUS_STYLES[record.status].badge}`}
                              >
                                <StatusIcon
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                                {
                                  STAFF_ATTENDANCE_STATUS_STYLES[record.status]
                                    .label
                                }
                              </span>
                            );
                          })()}
                          {record.nightShift &&
                            record.status !== "NIGHT_SHIFT" && (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${STAFF_ATTENDANCE_STATUS_STYLES.NIGHT_SHIFT.badge}`}
                              >
                                <MoonStar
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                                Night shift
                              </span>
                            )}
                          {record.overtimeHours > 0 &&
                            record.status !== "OVERTIME" && (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${STAFF_ATTENDANCE_STATUS_STYLES.OVERTIME.badge}`}
                              >
                                <Timer
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                                OT
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-steel-700 dark:text-steel-200">
                        {record.nightShift || record.status === "NIGHT_SHIFT"
                          ? "Yes"
                          : "No"}
                      </td>
                      <td className="px-4 py-3 text-steel-700 dark:text-steel-200">
                        {record.overtimeHours || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
