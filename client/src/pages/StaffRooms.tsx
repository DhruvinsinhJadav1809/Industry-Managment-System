import {
  ArrowLeft,
  BedDouble,
  Building2,
  Check,
  History,
  Pencil,
  Plus,
  RefreshCw,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  ConfirmDialog,
  Modal,
  Select,
} from "../components/common";
import { useToast } from "../context/ToastContext";
import type { ApiErrorShape } from "../lib/axios";
import { AppLayout } from "../layouts/AppLayout";
import { staffRoomService } from "../services/staffRoomService";
import { userService } from "../services/userService";
import type {
  StaffRoom,
  StaffRoomAllocation,
  StaffRoomPerson,
} from "../types/staffRoom";
import type { UserListItem } from "../types/user";

const ROOM_STATUSES = ["Active", "Maintenance", "Inactive"] as const;
const STAFF_PAGE_SIZE = 100;

export default function StaffRooms() {
  const toast = useToast();
  const [rooms, setRooms] = useState<StaffRoom[]>([]);
  const [staff, setStaff] = useState<UserListItem[]>([]);
  const [allocations, setAllocations] = useState<StaffRoomAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [roomDialog, setRoomDialog] = useState<StaffRoom | "create" | null>(
    null,
  );
  const [allocatingRoom, setAllocatingRoom] = useState<StaffRoom | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [deletingRoom, setDeletingRoom] = useState<StaffRoom | null>(null);
  const [vacatingStaff, setVacatingStaff] =
    useState<StaffRoomAllocation | null>(null);
  const [historyTarget, setHistoryTarget] = useState<
    | { type: "room"; room: StaffRoom }
    | { type: "staff"; staff: StaffRoomPerson }
    | null
  >(null);
  const [staffHistory, setStaffHistory] = useState<StaffRoomAllocation[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [transferTargets, setTransferTargets] = useState<
    Record<string, string>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [roomResponse, staffResponse] = await Promise.all([
        staffRoomService.getRooms(),
        userService.list({ page: 1, pageSize: STAFF_PAGE_SIZE, roleId: 3 }),
      ]);
      const nextRooms = roomResponse.data ?? [];
      const historyResponses = await Promise.all(
        nextRooms.map((room) => staffRoomService.getRoomAllocations(room.id)),
      );
      setRooms(nextRooms);
      setStaff(
        (staffResponse.data.items ?? []).filter((member) => member.isActive),
      );
      setAllocations(
        historyResponses.flatMap((response) => response.data ?? []),
      );
    } catch (error) {
      setLoadError(
        (error as ApiErrorShape).message || "Could not load staff rooms.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeAllocations = useMemo(
    () => allocations.filter((allocation) => allocation.isActive),
    [allocations],
  );
  const allocatedStaffIds = useMemo(
    () => new Set(activeAllocations.map((allocation) => allocation.staff.id)),
    [activeAllocations],
  );
  const availableStaff = useMemo(
    () => staff.filter((member) => !allocatedStaffIds.has(member.id)),
    [staff, allocatedStaffIds],
  );
  const activeRooms = useMemo(
    () => rooms.filter((room) => room.status === "Active"),
    [rooms],
  );
  const totalCapacity = rooms.reduce((total, room) => total + room.capacity, 0);

  const saveRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      roomNumber: String(formData.get("roomNumber") ?? "").trim(),
      floor: String(formData.get("floor") ?? "").trim(),
      capacity: Number(formData.get("capacity")),
    };
    const status = String(
      formData.get("status") ?? "Active",
    ) as StaffRoom["status"];
    setIsSaving(true);
    try {
      if (roomDialog === "create") {
        await staffRoomService.createRoom(payload);
        toast.success("Staff room created.");
      } else if (roomDialog) {
        await staffRoomService.updateRoom(roomDialog.id, {
          ...payload,
          status,
        });
        toast.success("Staff room updated.");
      }
      setRoomDialog(null);
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message || "Room could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const allocateSelectedStaff = async () => {
    if (!allocatingRoom || selectedStaffIds.length === 0) return;
    setIsSaving(true);
    try {
      await staffRoomService.allocateStaff(allocatingRoom.id, selectedStaffIds);
      toast.success(
        `${selectedStaffIds.length} staff member${selectedStaffIds.length === 1 ? "" : "s"} allocated to ${allocatingRoom.roomNumber}.`,
      );
      setAllocatingRoom(null);
      setSelectedStaffIds([]);
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message || "Staff could not be allocated.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRoom = async () => {
    if (!deletingRoom) return;
    setIsSaving(true);
    try {
      await staffRoomService.deleteRoom(deletingRoom.id);
      toast.success(`Room ${deletingRoom.roomNumber} deleted.`);
      setDeletingRoom(null);
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message || "Room could not be deleted.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const transferStaff = async (allocation: StaffRoomAllocation) => {
    const roomId = transferTargets[allocation.staff.id];
    if (!roomId) return;
    setIsSaving(true);
    try {
      await staffRoomService.transferStaff(allocation.staff.id, roomId);
      toast.success(
        `${allocation.staff.fullName ?? "Staff member"} transferred.`,
      );
      setTransferTargets((current) => ({
        ...current,
        [allocation.staff.id]: "",
      }));
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message ||
          "Staff member could not be transferred.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const vacateStaff = async () => {
    if (!vacatingStaff) return;
    setIsSaving(true);
    try {
      await staffRoomService.vacateStaff(vacatingStaff.staff.id);
      toast.success(
        `${vacatingStaff.staff.fullName ?? "Staff member"} removed from room.`,
      );
      setVacatingStaff(null);
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message || "Allocation could not be ended.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openStaffHistory = async (person: StaffRoomPerson) => {
    setHistoryTarget({ type: "staff", staff: person });
    setStaffHistory([]);
    setHistoryError(null);
    setIsHistoryLoading(true);
    try {
      const response = await staffRoomService.getStaffRoomHistory(person.id);
      setStaffHistory(response.data ?? []);
    } catch (error) {
      setHistoryError(
        (error as ApiErrorShape).message ||
          "Could not load allocation history.",
      );
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    setHistoryTarget(null);
    setHistoryError(null);
    setStaffHistory([]);
  };

  const roomBeingEdited = roomDialog !== "create" ? roomDialog : null;
  const roomOccupants = (roomId: string) =>
    activeAllocations.filter((allocation) => allocation.room.id === roomId);
  const roomHistory = (roomId: string) =>
    allocations
      .filter((allocation) => allocation.room.id === roomId)
      .sort(
        (first, second) =>
          new Date(second.allocatedAt).getTime() -
          new Date(first.allocatedAt).getTime(),
      );
  const historyRecords =
    historyTarget?.type === "room"
      ? roomHistory(historyTarget.room.id)
      : staffHistory;

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-steel-200 pb-5 dark:border-steel-800">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
              <Building2 className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
                Staff housing
              </p>
              <h1 className="font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
                Rooms & allocations
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/staff">
              <Button
                variant="secondary"
                icon={<ArrowLeft className="size-4" aria-hidden="true" />}
              >
                Back to list
              </Button>
            </Link>
            <Button
              variant="secondary"
              aria-label="Refresh room data"
              onClick={() => void loadData()}
              icon={<RefreshCw className="size-4" aria-hidden="true" />}
            >
              Refresh
            </Button>
            <Button
              onClick={() => setRoomDialog("create")}
              icon={<Plus className="size-4" aria-hidden="true" />}
            >
              Create room
            </Button>
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-400/40 dark:bg-amber-400/10">
          <div className="border-b border-amber-200 border-l-amber-500 px-4 py-3 dark:border-amber-400/20 dark:border-l-amber-400">
            <h2 className="font-display font-bold text-steel-900 dark:text-steel-50">
              Allocation rules
            </h2>
          </div>
          <p className="px-4 py-3 text-sm text-steel-700 dark:text-steel-200">
            Each active staff member can occupy one active room at a time.
            Transfers preserve allocation history; ending an allocation releases
            the bed.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-steel-200 bg-steel-200 sm:grid-cols-3 dark:border-steel-800 dark:bg-steel-800">
          <Metric icon={<BedDouble />} label="Rooms" value={rooms.length} />
          <Metric
            icon={<Users />}
            label="Staff housed"
            value={activeAllocations.length}
          />
          <Metric
            icon={<UserPlus />}
            label="Open beds"
            value={Math.max(0, totalCapacity - activeAllocations.length)}
          />
        </section>

        {loadError && <Alert variant="error">{loadError}</Alert>}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-steel-900 dark:text-steel-50">
              Room inventory
            </h2>
            <span className="font-mono text-xs text-steel-500 dark:text-steel-400">
              {rooms.length} total
            </span>
          </div>

          {isLoading ? (
            <div className="rounded-lg border border-steel-200 bg-white py-12 text-center text-sm text-steel-500 dark:border-steel-800 dark:bg-steel-900 dark:text-steel-400">
              Loading rooms and allocations...
            </div>
          ) : rooms.length === 0 ? (
            <div className="rounded-lg border border-dashed border-steel-300 bg-white px-5 py-12 text-center dark:border-steel-700 dark:bg-steel-900/50">
              <BedDouble
                className="mx-auto size-8 text-steel-400"
                aria-hidden="true"
              />
              <p className="mt-3 font-semibold text-steel-800 dark:text-steel-100">
                No rooms created
              </p>
              <p className="mt-1 text-sm text-steel-500 dark:text-steel-400">
                Create a room to begin assigning staff accommodation.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {rooms.map((room) => {
                const occupants = roomOccupants(room.id);
                const canAllocate =
                  room.status === "Active" &&
                  room.availableCapacity > 0 &&
                  availableStaff.length > 0;
                return (
                  <article
                    key={room.id}
                    className="overflow-hidden rounded-lg border border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-900"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-steel-100 px-4 py-4 dark:border-steel-800">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                          <BedDouble className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="font-display text-lg font-bold text-steel-900 dark:text-steel-50">
                            {room.roomNumber}
                          </h3>
                          <p className="text-sm text-steel-500 dark:text-steel-400">
                            Floor {room.floor}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${
                          room.status === "Active"
                            ? "bg-signal-500/10 text-signal-500"
                            : "bg-steel-100 text-steel-600 dark:bg-steel-800 dark:text-steel-300"
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                    <div className="px-4 py-4">
                      <div className="mb-4 flex items-center justify-between text-sm">
                        <span className="text-steel-500 dark:text-steel-400">
                          Occupancy
                        </span>
                        <span className="font-semibold tabular-nums text-steel-900 dark:text-steel-50">
                          {room.allocatedCount} / {room.capacity}
                          <span className="ml-2 font-normal text-steel-500 dark:text-steel-400">
                            ({room.availableCapacity} open)
                          </span>
                        </span>
                      </div>
                      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-steel-100 dark:bg-steel-800">
                        <div
                          className="h-full rounded-full bg-signal-500 transition-[width]"
                          style={{
                            width: `${Math.min(100, (room.allocatedCount / room.capacity) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        {occupants.length === 0 ? (
                          <p className="py-2 text-sm text-steel-500 dark:text-steel-400">
                            No staff currently assigned.
                          </p>
                        ) : (
                          occupants.map((allocation) => (
                            <div
                              key={allocation.id}
                              className="flex flex-wrap items-center justify-between gap-3 border-t border-steel-100 pt-3 first:border-0 first:pt-0 dark:border-steel-800"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-steel-800 dark:text-steel-100">
                                  {allocation.staff.fullName ?? "Staff member"}
                                </p>
                                <p className="truncate text-xs text-steel-500 dark:text-steel-400">
                                  {allocation.staff.email ?? ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  title="View staff allocation history"
                                  aria-label={`View allocation history for ${allocation.staff.fullName ?? "staff member"}`}
                                  onClick={() =>
                                    void openStaffHistory(allocation.staff)
                                  }
                                  className="rounded-md p-2 text-steel-500 hover:bg-steel-100 hover:text-steel-900 dark:text-steel-400 dark:hover:bg-steel-800 dark:hover:text-steel-50"
                                >
                                  <History
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                </button>
                                <div className="w-40 max-w-[45vw]">
                                  <Select
                                    aria-label={`Transfer ${allocation.staff.fullName ?? "staff member"} to another room`}
                                    value={
                                      transferTargets[allocation.staff.id] ?? ""
                                    }
                                    onChange={(event) =>
                                      setTransferTargets((current) => ({
                                        ...current,
                                        [allocation.staff.id]:
                                          event.target.value,
                                      }))
                                    }
                                    placeholder="Transfer to..."
                                    options={activeRooms
                                      .filter(
                                        (target) =>
                                          target.id !== room.id &&
                                          target.availableCapacity > 0,
                                      )
                                      .map((target) => ({
                                        value: target.id,
                                        label: `${target.roomNumber} · ${target.availableCapacity} open`,
                                      }))}
                                  />
                                </div>
                                <button
                                  type="button"
                                  title="Transfer staff"
                                  aria-label={`Transfer ${allocation.staff.fullName ?? "staff member"}`}
                                  disabled={
                                    !transferTargets[allocation.staff.id] ||
                                    isSaving
                                  }
                                  onClick={() => void transferStaff(allocation)}
                                  className="rounded-md p-2 text-steel-500 hover:bg-steel-100 hover:text-steel-900 disabled:opacity-40 dark:text-steel-400 dark:hover:bg-steel-800 dark:hover:text-steel-50"
                                >
                                  <Check
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                </button>
                                <button
                                  type="button"
                                  title="End allocation"
                                  aria-label={`End room allocation for ${allocation.staff.fullName ?? "staff member"}`}
                                  onClick={() => setVacatingStaff(allocation)}
                                  className="rounded-md p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                >
                                  <UserMinus
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-steel-100 pt-3 dark:border-steel-800">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            title="View room allocation history"
                            aria-label={`View allocation history for room ${room.roomNumber}`}
                            onClick={() =>
                              setHistoryTarget({ type: "room", room })
                            }
                            className="rounded-md p-2 text-steel-500 hover:bg-steel-100 hover:text-steel-900 dark:text-steel-400 dark:hover:bg-steel-800 dark:hover:text-steel-50"
                          >
                            <History className="size-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            title="Edit room"
                            aria-label={`Edit room ${room.roomNumber}`}
                            onClick={() => setRoomDialog(room)}
                            className="rounded-md p-2 text-steel-500 hover:bg-steel-100 hover:text-steel-900 dark:text-steel-400 dark:hover:bg-steel-800 dark:hover:text-steel-50"
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            title={
                              room.allocatedCount > 0
                                ? "Vacate all staff before deleting"
                                : "Delete room"
                            }
                            aria-label={`Delete room ${room.roomNumber}`}
                            disabled={room.allocatedCount > 0}
                            onClick={() => setDeletingRoom(room)}
                            className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            <X className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={!canAllocate}
                          onClick={() => {
                            setSelectedStaffIds([]);
                            setAllocatingRoom(room);
                          }}
                          icon={
                            <UserPlus className="size-4" aria-hidden="true" />
                          }
                        >
                          Allocate staff
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={roomDialog !== null}
        onClose={() => setRoomDialog(null)}
        title={
          roomDialog === "create" ? "Create staff room" : "Edit staff room"
        }
        description="Room numbers are unique. Capacity cannot be reduced below current occupancy."
      >
        <form className="space-y-4" onSubmit={(event) => void saveRoom(event)}>
          <Field
            label="Room number"
            name="roomNumber"
            defaultValue={roomBeingEdited?.roomNumber ?? ""}
            required
            maxLength={30}
          />
          <Field
            label="Floor"
            name="floor"
            defaultValue={roomBeingEdited?.floor ?? ""}
            required
            maxLength={50}
          />
          <Field
            label="Capacity"
            name="capacity"
            type="number"
            defaultValue={roomBeingEdited?.capacity ?? 1}
            required
            min={roomBeingEdited?.allocatedCount ?? 1}
            step={1}
          />
          {roomBeingEdited && (
            <Select
              label="Status"
              name="status"
              defaultValue={roomBeingEdited.status}
              options={ROOM_STATUSES.map((status) => ({
                value: status,
                label: status,
              }))}
            />
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRoomDialog(null)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {roomDialog === "create" ? "Create room" : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={allocatingRoom !== null}
        onClose={() => setAllocatingRoom(null)}
        title={
          allocatingRoom
            ? `Allocate to ${allocatingRoom.roomNumber}`
            : "Allocate staff"
        }
        description={
          allocatingRoom
            ? `${allocatingRoom.availableCapacity} bed${allocatingRoom.availableCapacity === 1 ? "" : "s"} available. Select only staff without an active room.`
            : undefined
        }
      >
        <div className="space-y-4">
          {availableStaff.length === 0 ? (
            <Alert variant="info">
              All active staff members already have a room allocation.
            </Alert>
          ) : (
            <div className="max-h-80 space-y-1 overflow-y-auto">
              {availableStaff.map((member) => {
                const checked = selectedStaffIds.includes(member.id);
                const atCapacity =
                  selectedStaffIds.length >=
                    (allocatingRoom?.availableCapacity ?? 0) && !checked;
                return (
                  <label
                    key={member.id}
                    className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${
                      checked
                        ? "border-steel-500 bg-steel-50 dark:border-amber-400/70 dark:bg-steel-800/70"
                        : "border-steel-200 hover:bg-steel-50 dark:border-steel-800 dark:hover:bg-steel-800/50"
                    } ${atCapacity ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={atCapacity}
                      onChange={() =>
                        setSelectedStaffIds((current) =>
                          checked
                            ? current.filter((id) => id !== member.id)
                            : [...current, member.id],
                        )
                      }
                      className="size-4 accent-steel-800 dark:accent-amber-400"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-steel-900 dark:text-steel-50">
                        {member.fullName}
                      </span>
                      <span className="block truncate text-xs text-steel-500 dark:text-steel-400">
                        {member.email}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-steel-100 pt-3 dark:border-steel-800">
            <span className="text-sm text-steel-500 dark:text-steel-400">
              {selectedStaffIds.length} selected
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAllocatingRoom(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={selectedStaffIds.length === 0}
                isLoading={isSaving}
                onClick={() => void allocateSelectedStaff()}
              >
                Allocate
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={historyTarget !== null}
        onClose={closeHistory}
        title={
          historyTarget?.type === "room"
            ? `${historyTarget.room.roomNumber} history`
            : `${historyTarget?.staff.fullName ?? "Staff"} history`
        }
        description={
          historyTarget?.type === "room"
            ? `Allocation history for floor ${historyTarget.room.floor}.`
            : "Room assignments and transfers for this staff member."
        }
      >
        <div className="space-y-3">
          {isHistoryLoading ? (
            <p className="py-8 text-center text-sm text-steel-500 dark:text-steel-400">
              Loading allocation history...
            </p>
          ) : historyError ? (
            <Alert variant="error">{historyError}</Alert>
          ) : historyRecords.length === 0 ? (
            <p className="py-8 text-center text-sm text-steel-500 dark:text-steel-400">
              No allocation history found.
            </p>
          ) : (
            <div className="max-h-[55vh] overflow-y-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="sticky top-0 bg-white font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:bg-steel-900 dark:text-steel-400">
                  <tr>
                    <th className="px-2 py-2 font-medium">Staff</th>
                    <th className="px-2 py-2 font-medium">Room</th>
                    <th className="px-2 py-2 font-medium">Allocated</th>
                    <th className="px-2 py-2 font-medium">Vacated</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                  {historyRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-2 py-3">
                        <p className="font-semibold text-steel-800 dark:text-steel-100">
                          {record.staff.fullName ?? "Staff member"}
                        </p>
                        <p className="text-xs text-steel-500 dark:text-steel-400">
                          {record.staff.email ?? ""}
                        </p>
                      </td>
                      <td className="px-2 py-3 text-steel-700 dark:text-steel-200">
                        {record.room.roomNumber}
                        <span className="block text-xs text-steel-500 dark:text-steel-400">
                          Floor {record.room.floor}
                        </span>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-steel-600 dark:text-steel-300">
                        {formatDate(record.allocatedAt)}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-steel-600 dark:text-steel-300">
                        {record.vacatedAt ? formatDate(record.vacatedAt) : "-"}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`rounded-sm px-2 py-1 font-mono text-[10px] uppercase ${
                            record.isActive
                              ? "bg-signal-500/10 text-signal-500"
                              : "bg-steel-100 text-steel-600 dark:bg-steel-800 dark:text-steel-300"
                          }`}
                        >
                          {record.isActive ? "Active" : "Ended"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={deletingRoom !== null}
        title="Delete staff room?"
        description={`Room ${deletingRoom?.roomNumber ?? ""} will be removed. This cannot be undone.`}
        isLoading={isSaving}
        onCancel={() => setDeletingRoom(null)}
        onConfirm={() => void deleteRoom()}
      />
      <ConfirmDialog
        open={vacatingStaff !== null}
        title="End room allocation?"
        description={`${vacatingStaff?.staff.fullName ?? "This staff member"} will be removed from ${vacatingStaff?.room.roomNumber ?? "the room"}. The allocation remains in history.`}
        confirmLabel="End allocation"
        isLoading={isSaving}
        onCancel={() => setVacatingStaff(null)}
        onConfirm={() => void vacateStaff()}
      />
    </AppLayout>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 bg-white px-4 py-4 dark:bg-steel-900">
      <span className="text-steel-500 dark:text-amber-400">{icon}</span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
          {label}
        </p>
        <p className="font-display text-xl font-bold tabular-nums text-steel-900 dark:text-steel-50">
          {value}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  maxLength,
  min,
  step,
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
  required?: boolean;
  maxLength?: number;
  min?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        min={min}
        step={step}
        className="w-full rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none hover:border-steel-300 focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:focus:border-amber-400/70"
      />
    </label>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}
