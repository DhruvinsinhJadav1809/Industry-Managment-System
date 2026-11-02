import {
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  History,
  MessageSquareText,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import ExcelJS from "exceljs";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { Alert, Button, Select } from "../components/common";
import { ROLES } from "../constants/roles";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { ApiErrorShape } from "../lib/axios";
import { AppLayout } from "../layouts/AppLayout";
import { saveAs } from "file-saver";
import { staffTaskService } from "../services/staffTaskService";
import { userService } from "../services/userService";
import type { UserListItem } from "../types/user";
import type {
  CreateStaffTaskPayload,
  StaffTask,
  StaffTaskHistory,
  StaffTaskHistoryParams,
  StaffTaskMonthlyStaffReport,
  StaffTaskMonthlyWorkDay,
  StaffTaskPriority,
  StaffTaskShift,
  StaffTaskStatus,
  StaffTaskToday,
} from "../types/staffTask";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const SHIFT_OPTIONS = [
  { value: "DAY", label: "Day" },
  { value: "NIGHT", label: "Night" },
];

function isNonWorkingAttendance(status: string | null | undefined) {
  return (
    status === "ABSENT" || status === "WEEK_OFF" || status === "FESTIVAL_LEAVE"
  );
}

function todayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function currentMonthString() {
  return todayDateString().slice(0, 7);
}

function assignmentAvailabilityMessage(
  staff: StaffTaskToday["staffSummaries"][number] | undefined,
  remainingHours: number,
  otCapacityLeft: number,
) {
  if (!staff) return "Select staff with attendance marked to see available work hours.";
  if (isNonWorkingAttendance(staff.attendanceStatus)) {
    return `No work can be assigned for ${staff.attendanceStatus?.replace("_", " ")} attendance. Remaining hours: 0.`;
  }
  if (staff.attendanceStatus === "HALF_DAY") {
    return `${remainingHours} hours available on this shift. Half Day allows up to 4 hours per shift.`;
  }
  if (staff.overtimeAuthorized) {
    return `${remainingHours} hours available on this shift. Authorized OT remaining: ${otCapacityLeft} hours.`;
  }
  if (staff.attendanceStatus === "NIGHT_SHIFT") {
    return `${remainingHours} hours available on this shift. Night shift attendance is marked.`;
  }
  return `${remainingHours} hours available on this shift. Hours above 7 require OVERTIME attendance.`;
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function statusLabel(status: StaffTaskStatus) {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
  );
}

function statusClasses(status: StaffTaskStatus) {
  if (status === "COMPLETED")
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
  if (status === "IN_PROGRESS")
    return "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300";
  return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
}

function inputClasses() {
  return "w-full rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900/40 dark:text-steel-50 dark:focus:border-amber-400/70";
}

function TaskStatus({ status }: { status: StaffTaskStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(status)}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function TaskCard({
  task,
  onUpdate,
}: {
  task: StaffTask;
  onUpdate: (
    taskId: string,
    payload: { status?: StaffTaskStatus; comment?: string },
  ) => Promise<void>;
}) {
  const [status, setStatus] = useState(task.status);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (status === task.status && !comment.trim()) return;
    setError(null);
    setIsSaving(true);
    try {
      await onUpdate(task.id, {
        ...(status !== task.status ? { status } : {}),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      });
      setComment("");
    } catch (updateError) {
      setError((updateError as ApiErrorShape).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-steel-900 dark:text-steel-50">
              {task.title}
            </h3>
            <TaskStatus status={task.status} />
          </div>
          <p className="whitespace-pre-wrap text-sm text-steel-600 dark:text-steel-300">
            {task.description}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            task.priority === "HIGH"
              ? "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
              : task.priority === "MEDIUM"
                ? "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300"
                : "bg-steel-100 text-steel-700 dark:bg-steel-800 dark:text-steel-300"
          }`}
        >
          {task.priority} priority
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-steel-500 dark:text-steel-400">
        <span>{task.shift === "DAY" ? "Day shift" : "Night shift"}</span>
        <span>{task.estimatedHours} assigned hours</span>
        {task.overtimeHours > 0 && (
          <span className="font-semibold text-orange-700 dark:text-orange-300">
            {task.overtimeHours} OT hours
          </span>
        )}
      </div>

      {error && (
        <div className="mt-3">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {task.comments.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-steel-100 pt-3 dark:border-steel-800">
          {task.comments.map((item, index) => (
            <div
              key={`${item.authorId}-${item.createdAt}-${index}`}
              className="rounded-md bg-steel-50 px-3 py-2 text-sm dark:bg-steel-950/70"
            >
              <p className="whitespace-pre-wrap text-steel-700 dark:text-steel-200">
                {item.message}
              </p>
              <p className="mt-1 text-xs text-steel-400">
                {item.authorName} · {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {task.status === "COMPLETED" ? (
        <p className="mt-4 border-t border-steel-100 pt-4 text-sm text-steel-500 dark:border-steel-800 dark:text-steel-400">
          This task is completed and can no longer be changed.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 border-t border-steel-100 pt-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end dark:border-steel-800">
          <Select
            label="Task status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(event) =>
              setStatus(event.target.value as StaffTaskStatus)
            }
          />
          <label className="flex flex-col gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
            Progress update
            <input
              className={inputClasses()}
              value={comment}
              maxLength={2000}
              placeholder="Add a comment or progress note"
              onChange={(event) => setComment(event.target.value)}
            />
          </label>
          <Button
            type="button"
            variant="primary"
            disabled={isSaving || (status === task.status && !comment.trim())}
            onClick={() => void handleUpdate()}
            icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
          >
            Save update
          </Button>
        </div>
      )}
    </article>
  );
}

function AdminAssignmentForm({
  board,
  onCreated,
}: {
  board: StaffTaskToday;
  onCreated: () => Promise<void>;
}) {
  const toast = useToast();
  const [staffId, setStaffId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shift, setShift] = useState<StaffTaskShift>("DAY");
  const [priority, setPriority] = useState<StaffTaskPriority>("MEDIUM");
  const [estimatedHours, setEstimatedHours] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedStaff = board.staffSummaries.find(
    (staff) => staff.staffId === staffId,
  );
  const shiftSummary =
    shift === "DAY" ? selectedStaff?.dayShift : selectedStaff?.nightShift;
  const remainingHours =
    selectedStaff?.[
      shift === "DAY" ? "dayAvailableHours" : "nightAvailableHours"
    ] ?? 0;
  const otCapacityLeft = Math.max(
    0,
    (selectedStaff?.overtimeCapacityHours ?? 0) -
      (shiftSummary?.overtimeHours ?? 0),
  );
  const shiftOptions = SHIFT_OPTIONS.filter(
    (option) => option.value !== "NIGHT" || selectedStaff?.nightShiftEligible,
  );
  const assignmentBlocked =
    isNonWorkingAttendance(selectedStaff?.attendanceStatus) ||
    !selectedStaff?.attendanceMarked;

  useEffect(() => {
    if (shift === "NIGHT" && !selectedStaff?.nightShiftEligible)
      setShift("DAY");
  }, [selectedStaff?.nightShiftEligible, shift]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const payload: CreateStaffTaskPayload = {
        staffId,
        title: title.trim(),
        description: description.trim(),
        assignedDate: todayDateString(),
        shift,
        priority,
        estimatedHours: Number(estimatedHours),
      };
      await staffTaskService.create(payload);
      setTitle("");
      setDescription("");
      setEstimatedHours("1");
      toast.success("Task assigned successfully.");
      await onCreated();
    } catch (requestError) {
      const message =
        (requestError as ApiErrorShape).message ?? "Unable to assign task.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-steel-800 text-white dark:bg-amber-400 dark:text-steel-950">
          <Plus className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-steel-900 dark:text-steel-50">
            Assign a task
          </h2>
          <p className="text-xs text-steel-500 dark:text-steel-400">
            New assignments are limited to today.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Select
          label="Staff member"
          placeholder="Select staff"
          value={staffId}
          options={board.staffSummaries.map((staff) => ({
            value: staff.staffId,
            label: staff.attendanceMarked
              ? `${staff.staffName} (${staff.attendanceStatus?.replace("_", " ")})`
              : `${staff.staffName} (attendance not marked)`,
            disabled:
              !staff.attendanceMarked ||
              isNonWorkingAttendance(staff.attendanceStatus),
          }))}
          onChange={(event) => setStaffId(event.target.value)}
          required
        />
        <label className="flex flex-col gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
          Assignment date
          <input
            className={inputClasses()}
            type="date"
            value={todayDateString()}
            min={todayDateString()}
            max={todayDateString()}
            readOnly
          />
        </label>
        <label className="flex flex-col gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400 md:col-span-2">
          Task title
          <input
            className={inputClasses()}
            value={title}
            maxLength={160}
            required
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Inspect production line"
          />
        </label>
        <label className="flex flex-col gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400 md:col-span-2">
          Description
          <textarea
            className={`${inputClasses()} min-h-24 resize-y`}
            value={description}
            maxLength={4000}
            required
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the task and expected outcome"
          />
        </label>
        <Select
          label="Shift"
          value={shift}
          options={shiftOptions}
          onChange={(event) => setShift(event.target.value as StaffTaskShift)}
        />
        <Select
          label="Priority"
          value={priority}
          options={PRIORITY_OPTIONS}
          onChange={(event) =>
            setPriority(event.target.value as StaffTaskPriority)
          }
        />
        <label className="flex flex-col gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
          Estimated hours
          <input
            className={inputClasses()}
            type="number"
            min="0.25"
            max={remainingHours}
            step="0.25"
            required
            disabled={assignmentBlocked || remainingHours < 0.25}
            value={estimatedHours}
            onChange={(event) => setEstimatedHours(event.target.value)}
          />
          <span className="font-normal normal-case tracking-normal text-steel-500">
            {assignmentAvailabilityMessage(
              selectedStaff,
              remainingHours,
              otCapacityLeft,
            )}
          </span>
        </label>
        <div className="flex items-end">
          <Button
            type="submit"
            variant="primary"
            disabled={
              isSaving ||
              !staffId ||
              !selectedStaff?.attendanceMarked ||
              isNonWorkingAttendance(selectedStaff?.attendanceStatus) ||
              (shift === "NIGHT" && !selectedStaff.nightShiftEligible) ||
              Number(estimatedHours) > remainingHours ||
              remainingHours < 0.25
            }
            icon={<Plus className="size-4" aria-hidden="true" />}
          >
            {isSaving ? "Assigning..." : "Assign task"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function MonthlyWorkDownload({
  isAdmin,
}: {
  isAdmin: boolean;
}) {
  const toast = useToast();
  const [month, setMonth] = useState(currentMonthString);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadReport = async () => {
    setIsDownloading(true);
    try {
      const response = await staffTaskService.getMonthlyWorkReport(month);
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Industry Management System";
      workbook.subject = `Monthly staff work report for ${month}`;

      const summarySheet = workbook.addWorksheet("Monthly summary");
      summarySheet.columns = [
        { header: "Staff", key: "staff", width: 28 },
        { header: "Month", key: "month", width: 12 },
        { header: "Completed task estimate (h)", key: "completed", width: 28 },
        { header: "Completed OT (h)", key: "overtime", width: 18 },
        { header: "Eligible work days", key: "days", width: 19 },
        { header: "Avg completed estimate (h/day)", key: "average", width: 32 },
      ];
      for (const report of response.data.staff) {
        summarySheet.addRow({
          staff: report.staffName,
          month: response.data.month,
          completed: report.completedHours,
          overtime: report.overtimeHours,
          days: report.eligibleWorkDays,
          average: report.averageCompletedHours,
        });
      }
      summarySheet.views = [{ state: "frozen", ySplit: 1 }];
      summarySheet.autoFilter = {
        from: "A1",
        to: "F1",
      };
      summarySheet.getRow(1).font = { bold: true };
      summarySheet.addRow([]);
      summarySheet.addRow([
        "Average uses Present, Night Shift, and Overtime attendance days only; zero-work days count. Absent, Half Day, Week Off, Festival Leave, and unmarked days are excluded.",
      ]);
      summarySheet.addRow([
        "Completed hours are estimated task hours for tasks marked COMPLETED; OT includes only those completed tasks.",
      ]);

      const dailySheet = workbook.addWorksheet("Daily work log");
      dailySheet.columns = [
        { header: "Staff", key: "staff", width: 28 },
        { header: "Date", key: "date", width: 14 },
        { header: "Attendance", key: "attendance", width: 20 },
        { header: "Completed task estimate (h)", key: "completed", width: 28 },
        { header: "Completed OT (h)", key: "overtime", width: 18 },
        { header: "Tasks", key: "tasks", width: 12 },
        { header: "Completed tasks", key: "completedTasks", width: 18 },
      ];
      const reports = response.data.staff;
      const dailyRows = reports.flatMap((report: StaffTaskMonthlyStaffReport) =>
        report.days.map((day: StaffTaskMonthlyWorkDay) => ({
          staff: report.staffName,
          date: day.date,
          attendance: day.attendanceStatus?.replace(/_/g, " ") ?? "Not marked",
          completed: day.completedHours,
          overtime: day.overtimeHours,
          tasks: day.taskCount,
          completedTasks: day.completedTaskCount,
        })),
      );
      dailyRows.sort(
        (first, second) =>
          first.date.localeCompare(second.date) ||
          first.staff.localeCompare(second.staff),
      );
      for (const row of dailyRows) dailySheet.addRow(row);
      dailySheet.views = [{ state: "frozen", ySplit: 1 }];
      dailySheet.autoFilter = {
        from: "A1",
        to: "G1",
      };
      dailySheet.getRow(1).font = { bold: true };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const staffName = reports[0]?.staffName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      saveAs(
        blob,
        `monthly-work-${month}-${isAdmin ? "all-staff" : staffName || "my-work"}.xlsx`,
      );
      toast.success("Monthly work report downloaded.");
    } catch (downloadError) {
      toast.error(
        (downloadError as ApiErrorShape).message ??
          "Unable to download the monthly work report.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-steel-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between dark:border-steel-800 dark:bg-steel-900/80">
      <div>
        <h2 className="font-display text-lg font-bold text-steel-900 dark:text-steel-50">
          Monthly work log
        </h2>
        <p className="mt-1 text-xs text-steel-500 dark:text-steel-400">
          Completed tasks&apos; estimated hours and associated overtime by date.
          Averages include Present, Night Shift, and Overtime days (including
          zero-work days) and exclude leave, absent, and unmarked days.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
          Month
          <input
            className={inputClasses()}
            type="month"
            max={currentMonthString()}
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          disabled={isDownloading || !month}
          onClick={() => void downloadReport()}
          icon={<Download className="size-4" aria-hidden="true" />}
        >
          {isDownloading ? "Preparing..." : "Download monthly Excel"}
        </Button>
      </div>
    </section>
  );
}

function SummaryCards({ board }: { board: StaffTaskToday }) {
  const metrics = [
    {
      label: "Tasks today",
      value: board.totals.taskCount,
      detail: `${board.totals.pendingCount} pending · ${board.totals.inProgressCount} in progress`,
      icon: ClipboardCheck,
    },
    {
      label: "Completed",
      value: board.totals.completedCount,
      detail: "tasks marked complete",
      icon: CheckCircle2,
    },
    {
      label: "Assigned hours",
      value: board.totals.assignedHours,
      detail: `${board.totals.regularHours} regular hours`,
      icon: Clock3,
    },
    {
      label: "Overtime",
      value: board.totals.overtimeHours,
      detail: "hours above regular shift capacity",
      icon: CalendarCheck,
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, detail, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl border border-steel-200 bg-white p-4 shadow-sm dark:border-steel-800 dark:bg-steel-900/80"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">
              {label}
            </p>
            <Icon className="size-4 text-steel-400" aria-hidden="true" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
            {value}
          </p>
          <p className="mt-1 text-xs text-steel-500 dark:text-steel-400">
            {detail}
          </p>
        </div>
      ))}
    </div>
  );
}

function AdminTodayBoard({
  board,
  onRefresh,
}: {
  board: StaffTaskToday;
  onRefresh: () => Promise<void>;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-steel-200 bg-white shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-100 px-5 py-4 dark:border-steel-800">
        <div>
          <h2 className="font-display text-lg font-bold text-steel-900 dark:text-steel-50">
            Today's assignments
          </h2>
          <p className="text-xs text-steel-500 dark:text-steel-400">
            {displayDate(todayDateString())} · Task progress is updated by each
            staff member.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void onRefresh()}
          icon={<RefreshCw className="size-4" aria-hidden="true" />}
        >
          Refresh
        </Button>
      </div>
      {board.tasks.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-steel-500 dark:text-steel-400">
          No tasks have been assigned today.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-steel-50 text-xs uppercase tracking-wide text-steel-500 dark:bg-steel-950/60 dark:text-steel-400">
              <tr>
                <th className="px-4 py-3">Staff / task</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">OT</th>
                <th className="px-4 py-3">Status / updates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
              {board.tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-steel-900 dark:text-steel-50">
                      {task.staffName}
                    </p>
                    <p className="text-xs text-steel-500">{task.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    {task.shift === "DAY" ? "Day" : "Night"}
                  </td>
                  <td className="px-4 py-3">{task.priority}</td>
                  <td className="px-4 py-3">{task.estimatedHours} h</td>
                  <td className="px-4 py-3">{task.overtimeHours} h</td>
                  <td className="px-4 py-3">
                    <TaskStatus status={task.status} />
                    {task.comments.length > 0 && (
                      <details className="mt-2 max-w-sm text-xs text-steel-600 dark:text-steel-300">
                        <summary className="cursor-pointer">
                          {task.comments.length} progress update(s)
                        </summary>
                        <ul className="mt-2 space-y-2">
                          {task.comments.map((comment, index) => (
                            <li
                              key={`${comment.authorId}-${comment.createdAt}-${index}`}
                              className="rounded bg-steel-50 p-2 dark:bg-steel-950/60"
                            >
                              <p>{comment.message}</p>
                              <p className="mt-1 text-steel-400">
                                {comment.authorName}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AdminAllocationPanel({
  board,
  assignmentOpen,
  onToggleAssignment,
  onCreated,
}: {
  board: StaffTaskToday;
  assignmentOpen: boolean;
  onToggleAssignment: () => void;
  onCreated: () => Promise<void>;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-steel-200 bg-white shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-100 px-5 py-4 dark:border-steel-800">
        <div>
          <h2 className="font-display text-lg font-bold text-steel-900 dark:text-steel-50">
            Staff allocation
          </h2>
          <p className="text-xs text-steel-500 dark:text-steel-400">
            Hours assigned by shift, remaining OT hours, and night-shift
            availability.
          </p>
        </div>
        <Button
          type="button"
          variant={assignmentOpen ? "secondary" : "primary"}
          onClick={onToggleAssignment}
          icon={
            assignmentOpen ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )
          }
          aria-expanded={assignmentOpen}
          aria-controls="staff-task-assignment-form"
        >
          {assignmentOpen ? "Close form" : "Assign task"}
        </Button>
      </div>
      {assignmentOpen && (
        <div
          id="staff-task-assignment-form"
          className="border-b border-steel-100 p-5 dark:border-steel-800"
        >
          <AdminAssignmentForm board={board} onCreated={onCreated} />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-steel-50 text-xs uppercase tracking-wide text-steel-500 dark:bg-steel-950/60 dark:text-steel-400">
            <tr>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Attendance</th>
              <th className="px-4 py-3">Day assigned / remaining / OT</th>
              <th className="px-4 py-3">Night assigned / remaining / OT</th>
              <th className="px-4 py-3">Night shift available</th>
              <th className="px-4 py-3">OT hours available (Day / Night)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
            {board.staffSummaries.map((staff) => {
              const dayOtAvailable = Math.max(
                0,
                staff.overtimeCapacityHours - staff.dayShift.overtimeHours,
              );
              const nightOtAvailable = Math.max(
                0,
                staff.overtimeCapacityHours - staff.nightShift.overtimeHours,
              );
              return (
                <tr key={staff.staffId}>
                  <td className="px-4 py-3 font-semibold text-steel-900 dark:text-steel-50">
                    {staff.staffName}
                  </td>
                  <td className="px-4 py-3">
                    {staff.attendanceStatus?.replace("_", " ") ??
                      "Not marked"}
                  </td>
                  <td className="px-4 py-3">
                    {staff.dayShift.assignedHours} /{" "}
                    {staff.dayAvailableHours} /{" "}
                    {staff.dayShift.overtimeHours} h
                  </td>
                  <td className="px-4 py-3">
                    {staff.nightShift.assignedHours} /{" "}
                    {staff.nightAvailableHours} /{" "}
                    {staff.nightShift.overtimeHours} h
                  </td>
                  <td className="px-4 py-3">
                    {staff.nightShiftEligible ? "Available" : "Not available"}
                  </td>
                  <td className="px-4 py-3">
                    {staff.overtimeAuthorized
                      ? `${dayOtAvailable} h / ${staff.nightShiftEligible ? `${nightOtAvailable} h` : "—"}`
                      : "Not marked OVERTIME"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TaskHistory({ staff }: { staff: UserListItem[] }) {
  const [history, setHistory] = useState<StaffTaskHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    staffId: "",
    status: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const pageSize = 20;

  const params = useMemo<StaffTaskHistoryParams>(
    () => ({
      page,
      pageSize,
      ...(appliedFilters.from ? { from: appliedFilters.from } : {}),
      ...(appliedFilters.to ? { to: appliedFilters.to } : {}),
      ...(appliedFilters.staffId ? { staffId: appliedFilters.staffId } : {}),
      ...(appliedFilters.status
        ? { status: appliedFilters.status as StaffTaskStatus }
        : {}),
    }),
    [appliedFilters, page],
  );

  useEffect(() => {
    if (!isExpanded) return;
    let isCurrent = true;
    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await staffTaskService.getHistory(params);
        if (isCurrent) setHistory(response.data);
      } catch (loadError) {
        if (isCurrent) setError((loadError as ApiErrorShape).message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    void loadHistory();
    return () => {
      isCurrent = false;
    };
  }, [isExpanded, params]);

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const totalPages = Math.max(1, Math.ceil((history?.total ?? 0) / pageSize));

  return (
    <section className="overflow-hidden rounded-xl border border-steel-200 bg-white shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        aria-controls="staff-task-history"
      >
        <span className="flex items-center gap-3">
          <History className="size-5 text-steel-500" aria-hidden="true" />
          <span>
            <span className="block font-display text-lg font-bold text-steel-900 dark:text-steel-50">
              Task history
            </span>
            <span className="block text-xs text-steel-500 dark:text-steel-400">
              Historical assignments are available for review only.
            </span>
          </span>
        </span>
        {isExpanded ? (
          <ChevronUp className="size-5 text-steel-500" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-5 text-steel-500" aria-hidden="true" />
        )}
      </button>
      {isExpanded && (
        <div
          id="staff-task-history"
          className="border-t border-steel-100 dark:border-steel-800"
        >
          <form
            className="grid gap-3 border-b border-steel-100 p-4 sm:grid-cols-2 lg:grid-cols-5 dark:border-steel-800"
            onSubmit={handleFilterSubmit}
          >
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
              From
              <input
                className={inputClasses()}
                type="date"
                value={filters.from}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    from: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
              To
              <input
                className={inputClasses()}
                type="date"
                value={filters.to}
                max={todayDateString()}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    to: event.target.value,
                  }))
                }
              />
            </label>
            <Select
              label="Staff"
              value={filters.staffId}
              options={staff.map((member) => ({
                value: member.id,
                label: member.fullName,
              }))}
              placeholder="All staff"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  staffId: event.target.value,
                }))
              }
            />
            <Select
              label="Status"
              value={filters.status}
              options={STATUS_OPTIONS}
              placeholder="All statuses"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            />
            <div className="flex items-end">
              <Button type="submit" variant="secondary">
                Apply filters
              </Button>
            </div>
          </form>
          {error && (
            <div className="p-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          {isLoading ? (
            <p className="px-5 py-8 text-center text-sm text-steel-500">
              Loading task history...
            </p>
          ) : !history?.items.length ? (
            <p className="px-5 py-8 text-center text-sm text-steel-500">
              No matching historical tasks.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-steel-50 text-xs uppercase tracking-wide text-steel-500 dark:bg-steel-950/60 dark:text-steel-400">
                    <tr>
                      <th className="px-4 py-3">Date / staff</th>
                      <th className="px-4 py-3">Task</th>
                      <th className="px-4 py-3">Shift</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Assigned hours</th>
                      <th className="px-4 py-3">OT hours</th>
                      <th className="px-4 py-3">Updates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                    {history.items.map((task) => (
                      <tr key={task.id} className="align-top">
                        <td className="px-4 py-3">
                          <p className="font-medium text-steel-900 dark:text-steel-50">
                            {displayDate(task.assignedDate)}
                          </p>
                          <p className="text-xs text-steel-500">
                            {task.staffName}
                          </p>
                        </td>
                        <td className="max-w-xs px-4 py-3">
                          <p className="font-semibold text-steel-900 dark:text-steel-50">
                            {task.title}
                          </p>
                          <p className="line-clamp-2 text-xs text-steel-500">
                            {task.description}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {task.shift === "DAY" ? "Day" : "Night"}
                        </td>
                        <td className="px-4 py-3">
                          <TaskStatus status={task.status} />
                        </td>
                        <td className="px-4 py-3">{task.estimatedHours} h</td>
                        <td className="px-4 py-3">{task.overtimeHours} h</td>
                        <td className="max-w-sm px-4 py-3">
                          {task.comments.length > 0 ? (
                            <details>
                              <summary className="inline-flex cursor-pointer items-center gap-1 text-steel-600 dark:text-steel-300">
                                <MessageSquareText
                                  className="size-4"
                                  aria-hidden="true"
                                />
                                {task.comments.length} update(s)
                              </summary>
                              <ul className="mt-2 space-y-2 text-xs text-steel-600 dark:text-steel-300">
                                {task.comments.map((comment, index) => (
                                  <li
                                    key={`${comment.authorId}-${comment.createdAt}-${index}`}
                                    className="rounded bg-steel-50 p-2 dark:bg-steel-950/60"
                                  >
                                    <p>{comment.message}</p>
                                    <p className="mt-1 text-steel-400">
                                      {comment.authorName} ·{" "}
                                      {new Date(
                                        comment.createdAt,
                                      ).toLocaleString()}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-steel-100 px-5 py-3 text-sm dark:border-steel-800">
                <p className="text-steel-500">
                  {history.total} records · Page {history.page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default function StaffTasks() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.roleId === ROLES.ADMIN;
  const [board, setBoard] = useState<StaffTaskToday | null>(null);
  const [staff, setStaff] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    const response = await staffTaskService.getToday();
    setBoard(response.data);
  }, []);

  const loadStaff = useCallback(async () => {
    if (!isAdmin) return;
    const firstPage = await userService.list({
      page: 1,
      pageSize: 100,
      roleId: ROLES.STAFF,
    });
    const remainingPages = await Promise.all(
      Array.from(
        { length: Math.max(0, firstPage.data.totalPages - 1) },
        (_, index) =>
          userService.list({
            page: index + 2,
            pageSize: 100,
            roleId: ROLES.STAFF,
          }),
      ),
    );
    setStaff([
      ...(firstPage.data.items ?? []),
      ...remainingPages.flatMap((response) => response.data.items ?? []),
    ]);
  }, [isAdmin]);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([loadBoard(), loadStaff()]);
    } catch (loadError) {
      setError((loadError as ApiErrorShape).message);
    }
  }, [loadBoard, loadStaff]);

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([loadBoard(), loadStaff()]);
      } catch (loadError) {
        if (isCurrent) setError((loadError as ApiErrorShape).message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    void load();
    return () => {
      isCurrent = false;
    };
  }, [loadBoard, loadStaff]);

  const handleTaskUpdate = async (
    taskId: string,
    payload: { status?: StaffTaskStatus; comment?: string },
  ) => {
    setError(null);
    try {
      await staffTaskService.update(taskId, payload);
      toast.success("Task progress saved.");
      try {
        await loadBoard();
      } catch (loadError) {
        setError(
          `Task updated, but the latest assignments could not be loaded: ${(loadError as ApiErrorShape).message}`,
        );
      }
    } catch (updateError) {
      const message =
        (updateError as ApiErrorShape).message ?? "Unable to update task.";
      toast.error(message);
      throw updateError;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-steel-800 text-white dark:bg-amber-400 dark:text-steel-950">
            <ClipboardCheck className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
              {isAdmin ? "Staff operations" : "My work"}
            </p>
            <h1 className="font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
              {isAdmin ? "Task assignments & overtime" : "Today's tasks"}
            </h1>
            <p className="mt-1 text-sm text-steel-500 dark:text-steel-400">
              {isAdmin
                ? "Assign today's work, monitor completion, and review shift hours."
                : "Review your assigned work and share status or progress updates."}
            </p>
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}
        <MonthlyWorkDownload isAdmin={isAdmin} />
        {isLoading ? (
          <div className="rounded-xl border border-steel-200 bg-white px-5 py-12 text-center text-steel-500 dark:border-steel-800 dark:bg-steel-900/80">
            Loading today's tasks...
          </div>
        ) : !board ? (
          <div className="rounded-xl border border-steel-200 bg-white px-5 py-12 text-center text-steel-500 dark:border-steel-800 dark:bg-steel-900/80">
            Task data is unavailable.
          </div>
        ) : isAdmin ? (
          <>
            <AdminAllocationPanel
              board={board}
              assignmentOpen={assignmentOpen}
              onToggleAssignment={() =>
                setAssignmentOpen((current) => !current)
              }
              onCreated={refresh}
            />
            <SummaryCards board={board} />
            <AdminTodayBoard board={board} onRefresh={refresh} />
            <TaskHistory staff={staff} />
          </>
        ) : board.tasks.length === 0 ? (
          <section className="rounded-xl border border-steel-200 bg-white px-5 py-12 text-center dark:border-steel-800 dark:bg-steel-900/80">
            <CalendarCheck
              className="mx-auto size-8 text-steel-400"
              aria-hidden="true"
            />
            <p className="mt-3 font-semibold text-steel-800 dark:text-steel-100">
              No tasks assigned for today.
            </p>
            <p className="mt-1 text-sm text-steel-500">
              Your tasks will appear here when assigned.
            </p>
          </section>
        ) : (
          <>
            <SummaryCards board={board} />
            <div className="space-y-4">
              {board.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
