import { CalendarDays, CalendarPlus, Check, X } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Badge,
  Button,
  Modal,
  Pagination,
  Select,
} from "../components/common";
import { ROLES } from "../constants/roles";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { ApiErrorShape } from "../lib/axios";
import { AppLayout } from "../layouts/AppLayout";
import { staffLeaveService } from "../services/staffLeaveService";
import type {
  StaffLeaveHistory,
  StaffLeaveRequest,
  StaffLeaveStatus,
  StaffLeaveType,
} from "../types/staffLeave";

const PAGE_SIZE = 25;
const LEAVE_TYPE_OPTIONS = [
  { value: "FULL_DAY", label: "Full day" },
  { value: "HALF_DAY", label: "Half day" },
];

function localDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthEndDateString() {
  const now = new Date();
  return localDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function statusTone(status: StaffLeaveStatus) {
  if (status === "APPROVED") return "signal";
  if (status === "REJECTED") return "red";
  return "amber";
}

function statusLabel(status: StaffLeaveStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function dateLabel(request: StaffLeaveRequest) {
  const start = displayDate(request.startDate);
  return request.startDate === request.endDate
    ? start
    : `${start} - ${displayDate(request.endDate)}`;
}

export default function StaffLeaves() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.roleId === ROLES.ADMIN;
  const [history, setHistory] = useState<StaffLeaveHistory | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState<StaffLeaveType>("FULL_DAY");
  const [startDate, setStartDate] = useState(localDateString(new Date()));
  const [endDate, setEndDate] = useState(localDateString(new Date()));
  const [reason, setReason] = useState("");
  const [requestToReject, setRequestToReject] =
    useState<StaffLeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await staffLeaveService.getHistory({
        page,
        pageSize: PAGE_SIZE,
      });
      setHistory(response.data);
    } catch (loadError) {
      setError((loadError as ApiErrorShape).message);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await staffLeaveService.create({
        leaveType,
        startDate,
        endDate: leaveType === "HALF_DAY" ? startDate : endDate,
        reason: reason.trim(),
      });
      toast.success("Leave request submitted.");
      setReason("");
      setShowForm(false);
      setPage(1);
      if (page === 1) await loadHistory();
    } catch (submitError) {
      toast.error((submitError as ApiErrorShape).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewRequest = async (
    request: StaffLeaveRequest,
    status: Exclude<StaffLeaveStatus, "PENDING">,
    reviewReason?: string,
  ) => {
    setUpdatingId(request.id);
    try {
      await staffLeaveService.review(request.id, {
        status,
        ...(reviewReason ? { reason: reviewReason.trim() } : {}),
      });
      toast.success(`Leave request ${statusLabel(status).toLowerCase()}.`);
      setRequestToReject(null);
      setRejectionReason("");
      await loadHistory();
    } catch (reviewError) {
      toast.error((reviewError as ApiErrorShape).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const submitRejection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requestToReject || !rejectionReason.trim()) return;
    void reviewRequest(requestToReject, "REJECTED", rejectionReason);
  };

  const today = localDateString(new Date());
  const monthEnd = monthEndDateString();

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel-500">
              Staff
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
              {isAdmin ? "Leave requests" : "My leave"}
            </h1>
            <p className="mt-1 text-sm text-steel-500 dark:text-steel-400">
              {isAdmin
                ? "Review employee requests and browse leave history."
                : "View the status of your leave requests."}
            </p>
          </div>
          {!isAdmin && (
            <Button
              type="button"
              icon={<CalendarPlus className="size-4" aria-hidden="true" />}
              onClick={() => setShowForm((visible) => !visible)}
            >
              {showForm ? "Close form" : "Apply for leave"}
            </Button>
          )}
        </header>

        {!isAdmin && showForm && (
          <section className="rounded-xl border border-steel-200 bg-white p-4 shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
            <h2 className="font-display text-lg font-semibold text-steel-900 dark:text-steel-50">
              New leave request
            </h2>
            <form
              className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-12 xl:items-end"
              onSubmit={submitRequest}
            >
              <div className="sm:col-span-1 xl:col-span-2">
                <Select
                  id="leave-type"
                  label="Leave type"
                  options={LEAVE_TYPE_OPTIONS}
                  value={leaveType}
                  onChange={(event) => {
                    const type = event.target.value as StaffLeaveType;
                    setLeaveType(type);
                    if (type === "HALF_DAY") setEndDate(startDate);
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-1 xl:col-span-2">
                <label
                  htmlFor="leave-start-date"
                  className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
                >
                  {leaveType === "HALF_DAY" ? "Date" : "From"}
                </label>
                <input
                  id="leave-start-date"
                  type="date"
                  required
                  min={today}
                  max={monthEnd}
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    if (
                      leaveType === "HALF_DAY" ||
                      endDate < event.target.value
                    ) {
                      setEndDate(event.target.value);
                    }
                  }}
                  className="w-full rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900/40 dark:text-steel-50 dark:focus:border-amber-400/70"
                />
              </div>
              {leaveType === "FULL_DAY" && (
                <div className="flex flex-col gap-1.5 sm:col-span-1 xl:col-span-2">
                  <label
                    htmlFor="leave-end-date"
                    className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
                  >
                    To
                  </label>
                  <input
                    id="leave-end-date"
                    type="date"
                    required
                    min={startDate || today}
                    max={monthEnd}
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900/40 dark:text-steel-50 dark:focus:border-amber-400/70"
                  />
                </div>
              )}
              <div
                className={`flex flex-col gap-1.5 sm:col-span-2 ${leaveType === "HALF_DAY" ? "xl:col-span-6" : "xl:col-span-4"}`}
              >
                <label
                  htmlFor="leave-reason"
                  className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
                >
                  Reason
                </label>
                <input
                  id="leave-reason"
                  type="text"
                  required
                  maxLength={1000}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Let your administrator know why you need leave."
                  className="w-full rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900/40 dark:text-steel-50 dark:focus:border-amber-400/70"
                />
              </div>
              <div className="flex justify-end gap-2 sm:col-span-2 xl:col-span-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Submit
                </Button>
              </div>
            </form>
          </section>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-steel-900 dark:text-steel-50">
              {isAdmin ? "Request history" : "Leave history"}
            </h2>
            <p className="text-sm text-steel-500 dark:text-steel-400">
              {history?.total ?? 0}{" "}
              {(history?.total ?? 0) === 1 ? "request" : "requests"}
            </p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}
          {isLoading ? (
            <p className="py-8 text-center text-sm text-steel-500">
              Loading leave history...
            </p>
          ) : history?.items.length ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-steel-200 bg-white shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-steel-50 text-xs uppercase tracking-wide text-steel-500 dark:bg-steel-800/70 dark:text-steel-400">
                    <tr>
                      {isAdmin && <th className="px-4 py-3">Employee</th>}
                      <th className="px-4 py-3">Leave</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Review note</th>
                      {isAdmin && <th className="px-4 py-3">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                    {history.items.map((request) => (
                      <tr
                        key={request.id}
                        className="align-top text-steel-700 dark:text-steel-200"
                      >
                        {isAdmin && (
                          <td className="px-4 py-4 font-medium text-steel-900 dark:text-steel-50">
                            {request.staffName}
                          </td>
                        )}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {request.leaveType === "HALF_DAY"
                            ? "Half day"
                            : "Full day"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays
                              className="size-4 shrink-0 text-steel-400"
                              aria-hidden="true"
                            />
                            {dateLabel(request)}
                          </span>
                        </td>
                        <td className="max-w-xs px-4 py-4 whitespace-pre-wrap">
                          {request.reason}
                        </td>
                        <td className="px-4 py-4">
                          <Badge tone={statusTone(request.status)}>
                            {statusLabel(request.status)}
                          </Badge>
                        </td>
                        <td className="max-w-xs px-4 py-4 whitespace-pre-wrap">
                          {request.reviewReason || "-"}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-4">
                            {request.status === "PENDING" ? (
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="danger"
                                  icon={
                                    <X className="size-4" aria-hidden="true" />
                                  }
                                  disabled={updatingId !== null}
                                  onClick={() => setRequestToReject(request)}
                                >
                                  Reject
                                </Button>
                                <Button
                                  type="button"
                                  icon={
                                    <Check
                                      className="size-4"
                                      aria-hidden="true"
                                    />
                                  }
                                  isLoading={updatingId === request.id}
                                  disabled={updatingId !== null}
                                  onClick={() =>
                                    void reviewRequest(request, "APPROVED")
                                  }
                                >
                                  Approve
                                </Button>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                totalPages={Math.ceil(history.total / history.pageSize)}
                totalRecords={history.total}
                pageSize={history.pageSize}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-steel-300 px-4 py-10 text-center text-sm text-steel-500 dark:border-steel-700 dark:text-steel-400">
              No leave requests yet.
            </div>
          )}
        </section>
      </div>

      <Modal
        open={requestToReject !== null}
        onClose={() => {
          setRequestToReject(null);
          setRejectionReason("");
        }}
        title="Reject leave request"
        description="Add a reason for rejecting this request. The employee will see this note."
      >
        <form className="space-y-4" onSubmit={submitRejection}>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="rejection-reason"
              className="font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400"
            >
              Rejection reason
            </label>
            <textarea
              id="rejection-reason"
              required
              maxLength={1000}
              minLength={1}
              rows={4}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              className="w-full resize-y rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900/40 dark:text-steel-50 dark:focus:border-amber-400/70"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={updatingId !== null}
              onClick={() => {
                setRequestToReject(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={updatingId === requestToReject?.id}
              disabled={!rejectionReason.trim() || updatingId !== null}
            >
              Reject request
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
