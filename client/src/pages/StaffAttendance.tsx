import {
  CalendarDays,
  Check,
  Clock3,
  Download,
  MoonStar,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Select } from "../components/common";
import { StaffAttendanceSummary } from "../components/staff/StaffAttendanceSummary";
import { MONTH_OPTIONS } from "../constants/staffledger";
import { useToast } from "../context/ToastContext";
import type { ApiErrorShape } from "../lib/axios";
import { AppLayout } from "../layouts/AppLayout";
import { staffService } from "../services/staffservice";
import { userService } from "../services/userService";
import type {
  StaffAttendanceRecord,
  StaffAttendanceStatus,
  StaffAttendanceSummary as AttendanceSummary,
} from "../types/staff";
import type { UserListItem } from "../types/user";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const CURRENT_DATE = new Date();
const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "HALF_DAY", label: "Half day" },
  { value: "NIGHT_SHIFT", label: "Night shift" },
  { value: "OVERTIME", label: "Overtime" },
  { value: "WEEK_OFF", label: "Week off" },
  { value: "FESTIVAL_LEAVE", label: "Festival leave" },
];

interface AttendanceDraft {
  date: string;
  status: StaffAttendanceStatus | "";
  nightShift: boolean;
  overtimeHours: string;
  saved: boolean;
}

function monthDates(year: number, month: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return `${year}-${String(month).padStart(2, "0")}-${day}`;
  });
}

function createDrafts(
  year: number,
  month: number,
  records: StaffAttendanceRecord[],
): AttendanceDraft[] {
  const byDate = new Map(records.map((record) => [record.date, record]));
  return monthDates(year, month).map((date) => {
    const record = byDate.get(date);
    return {
      date,
      status: record?.status ?? "",
      nightShift: record?.nightShift ?? false,
      overtimeHours: record?.overtimeHours ? String(record.overtimeHours) : "",
      saved: Boolean(record),
    };
  });
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function isFutureDate(date: string) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return date > todayKey;
}

export default function StaffAttendance() {
  const toast = useToast();
  const [staff, setStaff] = useState<UserListItem[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    CURRENT_DATE.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(CURRENT_DATE.getFullYear());
  const [drafts, setDrafts] = useState<AttendanceDraft[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: 7 },
        (_, index) => CURRENT_DATE.getFullYear() - 3 + index,
      ),
    [],
  );

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const firstPage = await userService.list({
          page: 1,
          pageSize: 100,
          roleId: 3,
        });
        const remainingPages = await Promise.all(
          Array.from(
            { length: Math.max(0, firstPage.data.totalPages - 1) },
            (_, index) =>
              userService.list({
                page: index + 2,
                pageSize: 100,
                roleId: 3,
              }),
          ),
        );
        const items = [
          ...(firstPage.data.items ?? []),
          ...remainingPages.flatMap((response) => response.data.items ?? []),
        ];
        setStaff(items);
        setSelectedStaffId((current) => current || items[0]?.id || "");
      } catch (error) {
        setLoadingError((error as ApiErrorShape).message);
      } finally {
        setIsLoadingStaff(false);
      }
    };
    void loadStaff();
  }, []);

  useEffect(() => {
    if (!selectedStaffId) {
      setDrafts([]);
      setSummary(null);
      return;
    }

    const loadAttendance = async () => {
      setIsLoadingAttendance(true);
      setLoadingError(null);
      try {
        const response = await staffService.getMonthlyAttendance(
          selectedStaffId,
          selectedMonth,
          selectedYear,
        );
        setDrafts(
          createDrafts(selectedYear, selectedMonth, response.data.records),
        );
        setSummary(response.data.summary);
      } catch (error) {
        setLoadingError((error as ApiErrorShape).message);
        setDrafts(createDrafts(selectedYear, selectedMonth, []));
        setSummary(null);
      } finally {
        setIsLoadingAttendance(false);
      }
    };
    void loadAttendance();
  }, [selectedStaffId, selectedMonth, selectedYear, refreshKey]);

  const updateDraft = (date: string, patch: Partial<AttendanceDraft>) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.date === date ? { ...draft, ...patch } : draft,
      ),
    );
  };

  const saveDraft = async (draft: AttendanceDraft) => {
    if (!selectedStaffId || !draft.status || isFutureDate(draft.date)) return;
    setSavingDate(draft.date);
    try {
      await staffService.saveAttendance(selectedStaffId, {
        date: draft.date,
        status: draft.status,
        nightShift: draft.nightShift,
        overtimeHours: Number(draft.overtimeHours || 0),
      });
      toast.success("Attendance saved.");
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message || "Could not save attendance.",
      );
    } finally {
      setSavingDate(null);
    }
  };

  const downloadAttendanceSummary = async () => {
    setIsExporting(true);
    try {
      const attendanceByStaff = new Map<
        string,
        Awaited<ReturnType<typeof staffService.getMonthlyAttendance>>["data"]
      >();
      const batchSize = 8;
      for (let start = 0; start < staff.length; start += batchSize) {
        const batch = staff.slice(start, start + batchSize);
        const results = await Promise.all(
          batch.map(async (member) => ({
            staffId: member.id,
            attendance: await staffService.getMonthlyAttendance(
              member.id,
              selectedMonth,
              selectedYear,
            ),
          })),
        );
        results.forEach(({ staffId, attendance }) =>
          attendanceByStaff.set(staffId, attendance.data),
        );
      }

      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const dateHeaders = Array.from({ length: daysInMonth }, (_, index) =>
        String(index + 1).padStart(2, "0"),
      );
      const totalHeaders = [
        "Present",
        "Absent",
        "Half Leave",
        "Night Shift Days",
        "OT Days",
        "Total OT Hours",
        "Week Off",
        "Festival Leave",
      ];
      const headers = ["Employee", ...dateHeaders, ...totalHeaders];
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Attendance Summary");
      const lastColumn = headers.length;
      const lastColumnLetter = worksheet.getColumn(lastColumn).letter;
      const monthLabel = new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric",
      }).format(new Date(selectedYear, selectedMonth - 1, 1));

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);
      worksheet.getCell("A1").value = "MONTHLY ATTENDANCE SUMMARY";
      worksheet.getCell("A1").font = {
        bold: true,
        size: 18,
        color: { argb: "FFFFFFFF" },
      };
      worksheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E78" },
      };
      worksheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getRow(1).height = 32;

      worksheet.mergeCells(`A2:${lastColumnLetter}2`);
      worksheet.getCell("A2").value = `Attendance period: ${monthLabel}`;
      worksheet.getCell("A2").font = { bold: true, size: 12 };
      worksheet.getCell("A2").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getRow(2).height = 24;

      worksheet.mergeCells(`A3:${lastColumnLetter}3`);
      worksheet.getCell("A3").value =
        "Codes: P = Present | A = Absent | HL = Half Leave | N = Night Shift | OT = Overtime | WO = Week Off | FL = Festival Leave | — = No record";
      worksheet.getCell("A3").font = {
        italic: true,
        size: 10,
        color: { argb: "FF44546A" },
      };
      worksheet.getCell("A3").alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
      };
      worksheet.getRow(3).height = 22;

      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.height = 32;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4472C4" },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFB4C6E7" } },
          bottom: { style: "thin", color: { argb: "FFB4C6E7" } },
          left: { style: "thin", color: { argb: "FFB4C6E7" } },
          right: { style: "thin", color: { argb: "FFB4C6E7" } },
        };
      });

      const statusCodes: Record<StaffAttendanceStatus, string> = {
        PRESENT: "P",
        ABSENT: "A",
        HALF_DAY: "HL",
        NIGHT_SHIFT: "N",
        OVERTIME: "OT",
        WEEK_OFF: "WO",
        FESTIVAL_LEAVE: "FL",
      };
      const statusFills: Record<StaffAttendanceStatus, string> = {
        PRESENT: "FFE2F0D9",
        ABSENT: "FFFCE4D6",
        HALF_DAY: "FFFFF2CC",
        NIGHT_SHIFT: "FFDDEBF7",
        OVERTIME: "FFDDEBF7",
        WEEK_OFF: "FFE7E6E6",
        FESTIVAL_LEAVE: "FFE4DFEC",
      };

      const totals = {
        presentDays: 0,
        absentDays: 0,
        halfDays: 0,
        nightShifts: 0,
        overtimeDays: 0,
        overtimeHours: 0,
        weekOffs: 0,
        festivalLeaves: 0,
      };

      staff.forEach((member) => {
        const attendance = attendanceByStaff.get(member.id);
        const recordsByDate = new Map(
          (attendance?.records ?? []).map((record) => [
            Number(record.date.slice(8, 10)),
            record,
          ]),
        );
        const summary = attendance?.summary;
        totals.presentDays += summary?.presentDays ?? 0;
        totals.absentDays += summary?.absentDays ?? 0;
        totals.halfDays += summary?.halfDays ?? 0;
        totals.nightShifts += summary?.nightShifts ?? 0;
        totals.overtimeDays += summary?.overtimeDays ?? 0;
        totals.overtimeHours += summary?.overtimeHours ?? 0;
        totals.weekOffs += summary?.weekOffs ?? 0;
        totals.festivalLeaves += summary?.festivalLeaves ?? 0;

        const dailyStatuses = dateHeaders.map((_, index) => {
          const record = recordsByDate.get(index + 1);
          if (!record) return "—";
          const codes = [statusCodes[record.status]];
          if (record.nightShift && record.status !== "NIGHT_SHIFT")
            codes.push("N");
          if (record.overtimeHours > 0 && record.status !== "OVERTIME")
            codes.push("OT");
          return [...new Set(codes)].join(" / ");
        });
        const row = worksheet.addRow([
          member.fullName,
          ...dailyStatuses,
          summary?.presentDays ?? 0,
          summary?.absentDays ?? 0,
          summary?.halfDays ?? 0,
          summary?.nightShifts ?? 0,
          summary?.overtimeDays ?? 0,
          summary?.overtimeHours ?? 0,
          summary?.weekOffs ?? 0,
          summary?.festivalLeaves ?? 0,
        ]);
        row.height = 22;
        row.eachCell((cell, columnNumber) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFD9E2F3" } },
            bottom: { style: "thin", color: { argb: "FFD9E2F3" } },
            left: { style: "thin", color: { argb: "FFD9E2F3" } },
            right: { style: "thin", color: { argb: "FFD9E2F3" } },
          };
          cell.alignment = {
            horizontal: columnNumber === 1 ? "left" : "center",
            vertical: "middle",
          };
          if (columnNumber > 1 && columnNumber <= daysInMonth + 1) {
            const record = recordsByDate.get(columnNumber - 1);
            if (record) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: statusFills[record.status] },
              };
              cell.font = { bold: true, size: 9 };
            }
          }
        });
      });

      const totalRow = worksheet.addRow([
        "TOTAL",
        ...dateHeaders.map(() => ""),
        totals.presentDays,
        totals.absentDays,
        totals.halfDays,
        totals.nightShifts,
        totals.overtimeDays,
        totals.overtimeHours,
        totals.weekOffs,
        totals.festivalLeaves,
      ]);
      totalRow.height = 26;
      totalRow.eachCell((cell, columnNumber) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD9EAD3" },
        };
        cell.alignment = {
          horizontal: columnNumber === 1 ? "left" : "center",
          vertical: "middle",
        };
        cell.border = {
          top: { style: "medium", color: { argb: "FF70AD47" } },
          bottom: { style: "thin", color: { argb: "FF70AD47" } },
          left: { style: "thin", color: { argb: "FF70AD47" } },
          right: { style: "thin", color: { argb: "FF70AD47" } },
        };
      });

      worksheet.getColumn(1).width = 26;
      for (let column = 2; column <= daysInMonth + 1; column += 1)
        worksheet.getColumn(column).width = 8;
      for (
        let column = daysInMonth + 2;
        column <= lastColumn;
        column += 1
      ) {
        worksheet.getColumn(column).width =
          headers[column - 1] === "Total OT Hours" ? 16 : 14;
      }
      worksheet.views = [{ state: "frozen", xSplit: 1, ySplit: 4 }];
      worksheet.autoFilter = {
        from: "A4",
        to: `${lastColumnLetter}4`,
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `attendance-summary-${selectedYear}-${String(selectedMonth).padStart(2, "0")}.xlsx`,
      );
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message ||
          "Could not download the attendance summary.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const staffOptions = staff.map((member) => ({
    value: member.id,
    label: member.fullName,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-steel-800 text-white dark:bg-amber-400 dark:text-steel-950">
            <CalendarDays className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
              Staff operations
            </p>
            <h1 className="font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
              Attendance
            </h1>
          </div>
        </header>

        {loadingError && <Alert variant="error">{loadingError}</Alert>}

        <section className="grid gap-4 rounded-lg border border-steel-200 bg-white p-4 sm:grid-cols-4 dark:border-steel-800 dark:bg-steel-900/80">
          <Select
            label="Staff member"
            options={staffOptions}
            value={selectedStaffId}
            onChange={(event) => setSelectedStaffId(event.target.value)}
            placeholder={isLoadingStaff ? "Loading staff..." : "Select staff"}
            disabled={isLoadingStaff || staff.length === 0}
          />
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
          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              icon={<Download className="size-4" aria-hidden="true" />}
              title="Downloads attendance for all employees for the selected month and year."
              onClick={() => void downloadAttendanceSummary()}
              disabled={isLoadingStaff || staff.length === 0}
              isLoading={isExporting}
              fullWidth
            >
              Download Excel
            </Button>
          </div>
        </section>

        {summary && <StaffAttendanceSummary summary={summary} />}

        <section className="overflow-hidden rounded-lg border border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-900/80">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-200 px-4 py-3 dark:border-steel-800">
            <div>
              <h2 className="font-semibold text-steel-900 dark:text-steel-50">
                Daily attendance
              </h2>
              <p className="text-sm text-steel-500 dark:text-steel-400">
                {staff.find((member) => member.id === selectedStaffId)
                  ?.fullName ?? "Select a staff member"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-steel-500 dark:text-steel-400">
              <MoonStar className="size-4" aria-hidden="true" /> Night shifts
              <Clock3 className="ml-2 size-4" aria-hidden="true" /> OT hours
            </div>
          </div>

          {!selectedStaffId && !isLoadingStaff ? (
            <div className="py-12 text-center text-steel-500 dark:text-steel-400">
              No staff members found.
            </div>
          ) : isLoadingAttendance ? (
            <div className="py-12 text-center text-steel-500 dark:text-steel-400">
              Loading monthly attendance...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                <thead className="bg-steel-50 text-xs uppercase text-steel-500 dark:bg-steel-950 dark:text-steel-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Attendance type</th>
                    <th className="px-4 py-3 font-semibold">Night shift</th>
                    <th className="px-4 py-3 font-semibold">OT hours</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                  {drafts.map((draft) => (
                    <tr
                      key={draft.date}
                      className={
                        isFutureDate(draft.date)
                          ? "bg-steel-50/60 dark:bg-steel-950/50"
                          : "hover:bg-steel-50/70 dark:hover:bg-steel-800/30"
                      }
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-steel-800 dark:text-steel-100">
                        {dateLabel(draft.date)}
                        {isFutureDate(draft.date) && (
                          <span className="ml-2 rounded border border-steel-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-steel-500 dark:border-steel-700 dark:text-steel-400">
                            Future
                          </span>
                        )}
                      </td>
                      <td className="w-56 px-4 py-2.5">
                        <Select
                          aria-label={`Attendance type for ${draft.date}`}
                          options={STATUS_OPTIONS}
                          value={draft.status}
                          disabled={isFutureDate(draft.date)}
                          onChange={(event) => {
                            const status = event.target
                              .value as StaffAttendanceStatus;
                            updateDraft(draft.date, {
                              status,
                              nightShift:
                                draft.nightShift || status === "NIGHT_SHIFT",
                              overtimeHours:
                                status === "PRESENT" || status === "OVERTIME"
                                  ? draft.status === "OVERTIME" &&
                                    status !== "OVERTIME"
                                    ? "0"
                                    : draft.overtimeHours
                                  : "0",
                            });
                          }}
                          placeholder="Unmarked"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <label className="inline-flex items-center gap-2 text-steel-700 dark:text-steel-200">
                          <input
                            type="checkbox"
                            checked={
                              draft.nightShift || draft.status === "NIGHT_SHIFT"
                            }
                            disabled={
                              isFutureDate(draft.date) ||
                              draft.status === "NIGHT_SHIFT"
                            }
                            onChange={(event) =>
                              updateDraft(draft.date, {
                                nightShift: event.target.checked,
                              })
                            }
                            className="size-4 accent-steel-800 dark:accent-amber-400"
                          />
                          {draft.status === "NIGHT_SHIFT" || draft.nightShift
                            ? "Recorded"
                            : "No"}
                        </label>
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={draft.overtimeHours}
                          disabled={isFutureDate(draft.date)}
                          onChange={(event) =>
                            updateDraft(draft.date, {
                              overtimeHours: event.target.value,
                            })
                          }
                          aria-label={`Overtime hours for ${draft.date}`}
                          className="w-24 rounded-md border border-steel-200 bg-white px-2.5 py-2 text-sm text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:focus:border-amber-400"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Button
                          type="button"
                          variant={draft.saved ? "secondary" : "primary"}
                          icon={
                            draft.saved ? (
                              <Check className="size-4" aria-hidden="true" />
                            ) : (
                              <Save className="size-4" aria-hidden="true" />
                            )
                          }
                          disabled={
                            isFutureDate(draft.date) ||
                            !draft.status ||
                            Number(draft.overtimeHours || 0) > 24 ||
                            (draft.status === "OVERTIME" &&
                              Number(draft.overtimeHours || 0) <= 0)
                          }
                          isLoading={savingDate === draft.date}
                          onClick={() => void saveDraft(draft)}
                          className="px-3 py-2"
                        >
                          {draft.saved ? "Update" : "Save"}
                        </Button>
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
