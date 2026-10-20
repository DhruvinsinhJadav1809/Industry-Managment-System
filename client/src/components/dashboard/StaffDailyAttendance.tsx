import { Check, Save, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, Button, Select } from "../common";
import { useToast } from "../../context/ToastContext";
import type { ApiErrorShape } from "../../lib/axios";
import { staffService } from "../../services/staffservice";
import { userService } from "../../services/userService";
import type {
  StaffAttendanceRecord,
  StaffAttendanceStatus,
  StaffDailyAttendanceInput,
} from "../../types/staff";
import type { UserListItem } from "../../types/user";

const CURRENT_DATE = new Date();
const TODAY_DATE = `${CURRENT_DATE.getFullYear()}-${String(CURRENT_DATE.getMonth() + 1).padStart(2, "0")}-${String(CURRENT_DATE.getDate()).padStart(2, "0")}`;
const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "HALF_DAY", label: "Half day" },
  { value: "NIGHT_SHIFT", label: "Night shift" },
  { value: "OVERTIME", label: "Overtime" },
  { value: "WEEK_OFF", label: "Week off" },
  { value: "FESTIVAL_LEAVE", label: "Festival leave" },
];

interface DailyAttendanceDraft extends Omit<
  StaffDailyAttendanceInput,
  "overtimeHours"
> {
  fullName: string;
  overtimeHours: string;
  saved: boolean;
}

function createDrafts(
  staff: UserListItem[],
  records: StaffAttendanceRecord[],
): DailyAttendanceDraft[] {
  const recordsByStaff = new Map(
    records.map((record) => [record.staffId, record]),
  );
  return staff.map((member) => {
    const record = recordsByStaff.get(member.id);
    return {
      staffId: member.id,
      fullName: member.fullName,
      status: record?.status ?? "PRESENT",
      nightShift: record?.nightShift ?? false,
      overtimeHours: record?.overtimeHours ? String(record.overtimeHours) : "0",
      saved: Boolean(record),
    };
  });
}

export function StaffDailyAttendance() {
  const toast = useToast();
  const [staff, setStaff] = useState<UserListItem[]>([]);
  const [dailyDrafts, setDailyDrafts] = useState<DailyAttendanceDraft[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);
  const [dailyReady, setDailyReady] = useState(false);
  const [dailyLocked, setDailyLocked] = useState(false);
  const [isSavingDaily, setIsSavingDaily] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const dailyDate = TODAY_DATE;

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
        setStaff([
          ...(firstPage.data.items ?? []),
          ...remainingPages.flatMap((response) => response.data.items ?? []),
        ]);
      } catch (error) {
        setDailyError((error as ApiErrorShape).message);
      } finally {
        setIsLoadingStaff(false);
      }
    };
    void loadStaff();
  }, []);

  useEffect(() => {
    if (!staff.length) {
      setDailyDrafts([]);
      setDailyReady(false);
      setDailyLocked(false);
      return;
    }

    let cancelled = false;
    const loadDailyAttendance = async () => {
      setIsLoadingDaily(true);
      setDailyReady(false);
      setDailyLocked(false);
      setDailyError(null);
      try {
        const response = await staffService.getDailyAttendance(dailyDate);
        if (cancelled) return;
        const records = response.data.records ?? [];
        const drafts = createDrafts(staff, records);
        setDailyDrafts(drafts);
        setDailyLocked(
          response.data.submitted || drafts.every((draft) => draft.saved),
        );
        setDailyReady(true);
      } catch (error) {
        if (cancelled) return;
        setDailyError((error as ApiErrorShape).message);
        setDailyDrafts(createDrafts(staff, []));
        setDailyReady(false);
      } finally {
        if (!cancelled) setIsLoadingDaily(false);
      }
    };
    void loadDailyAttendance();
    return () => {
      cancelled = true;
    };
  }, [staff]);

  const updateDraft = (
    staffId: string,
    patch: Partial<DailyAttendanceDraft>,
  ) => {
    if (dailyLocked) return;
    setDailyDrafts((current) =>
      current.map((draft) =>
        draft.staffId === staffId
          ? { ...draft, ...patch, saved: false }
          : draft,
      ),
    );
  };

  const invalidOvertime = dailyDrafts.some(
    (draft) =>
      Number(draft.overtimeHours || 0) > 24 ||
      (draft.status === "OVERTIME" && Number(draft.overtimeHours || 0) <= 0),
  );

  const saveAllAttendance = async () => {
    if (!dailyReady || !dailyDrafts.length || dailyLocked || invalidOvertime)
      return;

    setIsSavingDaily(true);
    setDailyError(null);
    try {
      await staffService.saveDailyAttendance({
        date: dailyDate,
        records: dailyDrafts.map((draft) => ({
          staffId: draft.staffId,
          status: draft.status,
          nightShift: draft.nightShift,
          overtimeHours: Number(draft.overtimeHours || 0),
        })),
      });
      setDailyDrafts((current) =>
        current.map((draft) => ({ ...draft, saved: true })),
      );
      setDailyLocked(true);
      toast.success(
        `Attendance saved for ${dailyDrafts.length} staff members.`,
      );
    } catch (error) {
      const message = (error as ApiErrorShape).message;
      setDailyError(message);
      toast.error(message || "Could not save daily attendance.");
    } finally {
      setIsSavingDaily(false);
    }
  };

  const controlsDisabled = dailyLocked || isSavingDaily;

  return (
    <section className="overflow-hidden rounded-lg border border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-900/80">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-200 px-4 py-4 dark:border-steel-800">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200">
            <UsersRound className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-steel-900 dark:text-steel-50">
              Daily team attendance
            </h2>
            <p className="text-sm text-steel-500 dark:text-steel-400">
              Review every staff member and save the day in one action.
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
            Attendance date
          </p>
          <p className="mt-1 text-sm font-semibold text-steel-900 dark:text-steel-100">
            Today ·{" "}
            {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
              CURRENT_DATE,
            )}
          </p>
        </div>
      </div>

      {dailyError && (
        <div className="px-4 pt-4">
          <Alert variant="error">{dailyError}</Alert>
        </div>
      )}

      {dailyLocked && !isLoadingDaily && (
        <div className="mx-4 mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
          Attendance is saved for this date. The roster is locked.
        </div>
      )}

      {isLoadingStaff || isLoadingDaily ? (
        <div className="py-10 text-center text-steel-500 dark:text-steel-400">
          Loading attendance roster...
        </div>
      ) : dailyDrafts.length === 0 ? (
        <div className="py-10 text-center text-steel-500 dark:text-steel-400">
          No staff members found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead className="bg-steel-50 text-xs uppercase text-steel-500 dark:bg-steel-950 dark:text-steel-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Staff member</th>
                  <th className="px-4 py-3 font-semibold">Attendance</th>
                  <th className="px-4 py-3 font-semibold">Night shift</th>
                  <th className="px-4 py-3 font-semibold">OT hours</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                {dailyDrafts.map((draft) => (
                  <tr key={draft.staffId}>
                    <td className="px-4 py-2.5 font-medium text-steel-800 dark:text-steel-100">
                      {draft.fullName}
                    </td>
                    <td className="w-56 px-4 py-2.5">
                      <Select
                        aria-label={`Attendance for ${draft.fullName}`}
                        options={STATUS_OPTIONS}
                        value={draft.status}
                        disabled={controlsDisabled}
                        onChange={(event) => {
                          const status = event.target
                            .value as StaffAttendanceStatus;
                          updateDraft(draft.staffId, {
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
                            controlsDisabled || draft.status === "NIGHT_SHIFT"
                          }
                          onChange={(event) =>
                            updateDraft(draft.staffId, {
                              nightShift: event.target.checked,
                            })
                          }
                          className="size-4 accent-steel-800 dark:accent-amber-400"
                        />
                        Night shift
                      </label>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={draft.overtimeHours}
                        disabled={controlsDisabled}
                        onChange={(event) =>
                          updateDraft(draft.staffId, {
                            overtimeHours: event.target.value,
                          })
                        }
                        aria-label={`Overtime hours for ${draft.fullName}`}
                        className="w-24 rounded-md border border-steel-200 bg-white px-2.5 py-2 text-sm text-steel-900 outline-none focus:border-steel-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:focus:border-amber-400"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      {draft.saved ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <Check className="size-4" aria-hidden="true" />
                          Saved
                        </span>
                      ) : (
                        <span className="text-xs text-steel-500 dark:text-steel-400">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-steel-200 px-4 py-3 dark:border-steel-800">
            <p className="text-sm text-steel-500 dark:text-steel-400">
              {dailyDrafts.filter((draft) => draft.saved).length} of{" "}
              {dailyDrafts.length} already saved
            </p>
            <Button
              type="button"
              icon={
                dailyLocked ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )
              }
              isLoading={isSavingDaily}
              disabled={!dailyReady || dailyLocked || invalidOvertime}
              onClick={() => void saveAllAttendance()}
            >
              {dailyLocked ? "Attendance saved" : "Save all attendance"}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
