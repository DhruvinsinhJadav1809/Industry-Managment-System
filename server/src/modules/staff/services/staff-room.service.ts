import mongoose, { Types } from "mongoose";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { ConflictError } from "../../../shared/errors/conflict.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { logger } from "../../../shared/helpers/logger";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { NotificationType } from "../../notification/enums/notification-type.enum";
import * as notificationService from "../../notification/services/notification.service";
import UserModel from "../../users/schemas/user.schema";
import {
  AllocateStaffRoomDto,
  CreateStaffRoomDto,
  TransferStaffRoomDto,
  UpdateStaffRoomDto,
} from "../dto/staff-room.dto";
import { StaffRoomAllocationModel } from "../schema/staff-room-allocation.schema";
import { StaffRoomModel } from "../schema/staff-room.schema";
import { StaffRoomStatus } from "../types/staff-room.types";

const toRoomResponse = (room: any) => ({
  id: room._id.toString(),
  roomNumber: room.roomNumber,
  floor: room.floor,
  capacity: room.capacity,
  allocatedCount: room.allocatedCount,
  availableCapacity: room.capacity - room.allocatedCount,
  status: room.status,
  createdAt: room.createdAt,
  updatedAt: room.updatedAt,
});

const ensureEmployee = async (staffId: string) => {
  const staff = await UserModel.findOne({
    _id: staffId,
    roleId: UserRole.Employee,
    isActive: true,
    isDeleted: false,
  }).select("_id fullName");
  if (!staff) throw new NotFoundError("Active staff user not found.");
  return staff;
};

const notifyStaff = async (
  recipients: string[],
  title: string,
  message: string,
  metadata: Record<string, unknown>,
  createdBy: string,
) => {
  try {
    await notificationService.send({
      title,
      message,
      type: NotificationType.STAFF_ROOM,
      recipients,
      metadata,
      actionUrl: "/staff/rooms",
      createdBy,
    });
  } catch {
    logger.warn("Staff room notification could not be delivered.");
  }
};

const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: number }).code === 11000;

const isTransactionConflict = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  [112, 251].includes((error as { code?: number }).code ?? -1);

export const getRooms = async () => {
  const rooms = await StaffRoomModel.find({ isDeleted: false })
    .sort({ roomNumber: 1 })
    .lean();
  return rooms.map(toRoomResponse);
};

export const createRoom = async (
  data: CreateStaffRoomDto,
  currentUserId: string,
) => {
  try {
    const room = await StaffRoomModel.create({
      ...data,
      roomNumber: data.roomNumber.trim().toUpperCase(),
      createdBy: new Types.ObjectId(currentUserId),
    });
    return toRoomResponse(room);
  } catch (error) {
    if (isDuplicateKeyError(error))
      throw new ConflictError("A room with this room number already exists.");
    throw error;
  }
};

export const updateRoom = async (
  roomId: string,
  data: UpdateStaffRoomDto,
  currentUserId: string,
) => {
  let room;
  try {
    room = await StaffRoomModel.findOneAndUpdate(
      {
        _id: roomId,
        isDeleted: false,
        ...(data.capacity === undefined
          ? {}
          : { $expr: { $lte: ["$allocatedCount", data.capacity] } }),
      },
      {
        $set: {
          ...data,
          ...(data.roomNumber
            ? { roomNumber: data.roomNumber.trim().toUpperCase() }
            : {}),
          updatedBy: new Types.ObjectId(currentUserId),
        },
      },
      { new: true, runValidators: true },
    );
  } catch (error) {
    if (isDuplicateKeyError(error))
      throw new ConflictError("A room with this room number already exists.");
    throw error;
  }
  if (!room) {
    const exists = await StaffRoomModel.exists({
      _id: roomId,
      isDeleted: false,
    });
    if (!exists) throw new NotFoundError("Staff room not found.");
    if (data.capacity !== undefined)
      throw new ConflictError(
        "Room capacity cannot be below current occupancy.",
      );
    throw new ConflictError("Room could not be updated. Refresh and retry.");
  }
  return toRoomResponse(room);
};

export const deleteRoom = async (roomId: string, currentUserId: string) => {
  const activeAllocations = await StaffRoomAllocationModel.countDocuments({
    roomId,
    isActive: true,
  });
  if (activeAllocations > 0)
    throw new ConflictError("A room with allocated staff cannot be deleted.");

  const room = await StaffRoomModel.findOneAndUpdate(
    { _id: roomId, isDeleted: false, allocatedCount: 0 },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: new Types.ObjectId(currentUserId),
      },
    },
    { new: true },
  );
  if (!room) {
    const exists = await StaffRoomModel.exists({
      _id: roomId,
      isDeleted: false,
    });
    if (!exists) throw new NotFoundError("Staff room not found.");
    throw new ConflictError("A room with allocated staff cannot be deleted.");
  }
  return toRoomResponse(room);
};

export const allocateStaff = async (
  roomId: string,
  data: AllocateStaffRoomDto,
  currentUserId: string,
) => {
  const staff = await UserModel.find({
    _id: { $in: data.staffIds },
    roleId: UserRole.Employee,
    isActive: true,
    isDeleted: false,
  }).select("_id");
  if (staff.length !== data.staffIds.length)
    throw new NotFoundError("One or more active staff users were not found.");

  const session = await mongoose.startSession();
  let roomResponse;
  let allocations: any[] = [];
  try {
    session.startTransaction();
    const room = await StaffRoomModel.findOne({
      _id: roomId,
      isDeleted: false,
    }).session(session);
    if (!room) throw new NotFoundError("Staff room not found.");
    if (room.status !== StaffRoomStatus.ACTIVE)
      throw new ConflictError("Staff can only be allocated to active rooms.");

    const existingAllocation = await StaffRoomAllocationModel.findOne({
      staffId: { $in: data.staffIds },
      isActive: true,
    }).session(session);
    if (existingAllocation)
      throw new ConflictError(
        "One or more staff members already have an active room allocation.",
      );

    const updatedRoom = await StaffRoomModel.findOneAndUpdate(
      {
        _id: roomId,
        isDeleted: false,
        status: StaffRoomStatus.ACTIVE,
        $expr: {
          $lte: [
            { $add: ["$allocatedCount", data.staffIds.length] },
            "$capacity",
          ],
        },
      },
      { $inc: { allocatedCount: data.staffIds.length } },
      { new: true, session },
    );
    if (!updatedRoom)
      throw new ConflictError("Room does not have enough available capacity.");

    allocations = await StaffRoomAllocationModel.create(
      data.staffIds.map((staffId) => ({
        roomId: new Types.ObjectId(roomId),
        staffId: new Types.ObjectId(staffId),
        allocatedBy: new Types.ObjectId(currentUserId),
      })),
      { session },
    );
    roomResponse = toRoomResponse(updatedRoom);
    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (isDuplicateKeyError(error))
      throw new ConflictError(
        "One or more staff members already have an active room allocation.",
      );
    if (isTransactionConflict(error))
      throw new ConflictError(
        "Room allocation changed concurrently. Refresh and retry.",
      );
    throw error;
  } finally {
    await session.endSession();
  }

  await notifyStaff(
    data.staffIds,
    "Room allocated",
    `You have been allocated to room ${roomResponse.roomNumber}.`,
    {
      roomId,
      roomNumber: roomResponse.roomNumber,
      allocationIds: allocations.map((item) => item._id.toString()),
    },
    currentUserId,
  );
  return {
    room: roomResponse,
    allocations: allocations.map((allocation) => ({
      id: allocation._id.toString(),
      staffId: allocation.staffId.toString(),
      roomId: allocation.roomId.toString(),
      allocatedAt: allocation.allocatedAt,
      vacatedAt: allocation.vacatedAt,
      isActive: allocation.isActive,
    })),
  };
};

export const transferStaff = async (
  staffId: string,
  data: TransferStaffRoomDto,
  currentUserId: string,
) => {
  await ensureEmployee(staffId);
  const session = await mongoose.startSession();
  let targetRoom: any;
  let allocation: any;
  let sourceRoomId = "";
  try {
    session.startTransaction();
    const currentAllocation = await StaffRoomAllocationModel.findOne({
      staffId,
      isActive: true,
    }).session(session);
    if (!currentAllocation)
      throw new NotFoundError("Staff member has no active room allocation.");
    if (currentAllocation.roomId.toString() === data.roomId)
      throw new BadRequestError(
        "Staff member is already allocated to this room.",
      );

    targetRoom = await StaffRoomModel.findOne({
      _id: data.roomId,
      isDeleted: false,
      status: StaffRoomStatus.ACTIVE,
    }).session(session);
    if (!targetRoom) {
      const roomExists = await StaffRoomModel.exists({
        _id: data.roomId,
        isDeleted: false,
      }).session(session);
      if (!roomExists) throw new NotFoundError("Staff room not found.");
      throw new ConflictError("Staff can only be transferred to active rooms.");
    }

    const reservedTarget = await StaffRoomModel.findOneAndUpdate(
      {
        _id: data.roomId,
        isDeleted: false,
        status: StaffRoomStatus.ACTIVE,
        $expr: { $lt: ["$allocatedCount", "$capacity"] },
      },
      { $inc: { allocatedCount: 1 } },
      { new: true, session },
    );
    if (!reservedTarget)
      throw new ConflictError("Target room does not have available capacity.");

    const vacatedAt = new Date();
    const vacated = await StaffRoomAllocationModel.updateOne(
      { _id: currentAllocation._id, isActive: true },
      {
        $set: {
          isActive: false,
          vacatedAt,
          vacatedBy: new Types.ObjectId(currentUserId),
        },
      },
      { session },
    );
    if (vacated.modifiedCount !== 1)
      throw new ConflictError(
        "Staff allocation changed concurrently. Refresh and retry.",
      );

    sourceRoomId = currentAllocation.roomId.toString();
    const releasedSource = await StaffRoomModel.updateOne(
      { _id: currentAllocation.roomId, allocatedCount: { $gt: 0 } },
      { $inc: { allocatedCount: -1 } },
      { session },
    );
    if (releasedSource.modifiedCount !== 1)
      throw new ConflictError(
        "Source room occupancy changed. Refresh and retry.",
      );

    [allocation] = await StaffRoomAllocationModel.create(
      [
        {
          roomId: new Types.ObjectId(data.roomId),
          staffId: new Types.ObjectId(staffId),
          allocatedBy: new Types.ObjectId(currentUserId),
        },
      ],
      { session },
    );
    targetRoom = reservedTarget;
    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (isDuplicateKeyError(error) || isTransactionConflict(error))
      throw new ConflictError(
        "Staff allocation changed concurrently. Refresh and retry.",
      );
    throw error;
  } finally {
    await session.endSession();
  }

  await notifyStaff(
    [staffId],
    "Room transfer",
    `You have been transferred to room ${targetRoom.roomNumber}.`,
    {
      fromRoomId: sourceRoomId,
      roomId: data.roomId,
      allocationId: allocation._id.toString(),
    },
    currentUserId,
  );
  return {
    id: allocation._id.toString(),
    staffId,
    roomId: data.roomId,
    roomNumber: targetRoom.roomNumber,
    allocatedAt: allocation.allocatedAt,
    vacatedAt: allocation.vacatedAt,
    isActive: allocation.isActive,
  };
};

export const vacateStaffRoom = async (
  staffId: string,
  currentUserId: string,
) => {
  const session = await mongoose.startSession();
  let allocation: any;
  let roomNumber = "";
  try {
    session.startTransaction();
    const activeAllocation = await StaffRoomAllocationModel.findOne({
      staffId,
      isActive: true,
    }).session(session);
    if (!activeAllocation)
      throw new NotFoundError("Staff member has no active room allocation.");

    const room = await StaffRoomModel.findById(activeAllocation.roomId).session(
      session,
    );
    if (!room) throw new NotFoundError("Allocated room not found.");
    roomNumber = room.roomNumber;

    const vacatedAt = new Date();
    const result = await StaffRoomAllocationModel.updateOne(
      { _id: activeAllocation._id, isActive: true },
      {
        $set: {
          isActive: false,
          vacatedAt,
          vacatedBy: new Types.ObjectId(currentUserId),
        },
      },
      { session },
    );
    if (result.modifiedCount !== 1)
      throw new ConflictError(
        "Staff allocation changed concurrently. Refresh and retry.",
      );

    const releasedRoom = await StaffRoomModel.updateOne(
      { _id: room._id, allocatedCount: { $gt: 0 } },
      { $inc: { allocatedCount: -1 } },
      { session },
    );
    if (releasedRoom.modifiedCount !== 1)
      throw new ConflictError("Room occupancy changed. Refresh and retry.");
    allocation = { ...activeAllocation.toObject(), isActive: false, vacatedAt };
    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (isTransactionConflict(error))
      throw new ConflictError(
        "Staff allocation changed concurrently. Refresh and retry.",
      );
    throw error;
  } finally {
    await session.endSession();
  }

  await notifyStaff(
    [staffId],
    "Room allocation ended",
    `Your allocation to room ${roomNumber} has ended.`,
    {
      roomId: allocation.roomId.toString(),
      allocationId: allocation._id.toString(),
    },
    currentUserId,
  );
  return {
    id: allocation._id.toString(),
    staffId,
    roomId: allocation.roomId.toString(),
    roomNumber,
    allocatedAt: allocation.allocatedAt,
    vacatedAt: allocation.vacatedAt,
    isActive: false,
  };
};

const allocationResponse = (allocation: any) => ({
  id: allocation._id.toString(),
  staff:
    allocation.staffId && typeof allocation.staffId === "object"
      ? {
          id: allocation.staffId._id.toString(),
          fullName: allocation.staffId.fullName,
          email: allocation.staffId.email,
        }
      : { id: allocation.staffId.toString() },
  room:
    allocation.roomId && typeof allocation.roomId === "object"
      ? {
          id: allocation.roomId._id.toString(),
          roomNumber: allocation.roomId.roomNumber,
          floor: allocation.roomId.floor,
        }
      : { id: allocation.roomId.toString() },
  allocatedAt: allocation.allocatedAt,
  vacatedAt: allocation.vacatedAt,
  isActive: allocation.isActive,
});

export const getRoomAllocationHistory = async (roomId: string) => {
  const room = await StaffRoomModel.findById(roomId);
  if (!room) throw new NotFoundError("Staff room not found.");
  const allocations = await StaffRoomAllocationModel.find({ roomId })
    .populate("staffId", "fullName email")
    .populate("roomId", "roomNumber floor")
    .sort({ allocatedAt: -1 })
    .lean();
  return allocations.map(allocationResponse);
};

export const getAllRoomAllocationHistory = async () => {
  const allocations = await StaffRoomAllocationModel.find()
    .populate("staffId", "fullName email")
    .populate("roomId", "roomNumber floor")
    .sort({ allocatedAt: -1 })
    .lean();
  return allocations.map(allocationResponse);
};

export const getStaffRoomHistory = async (staffId: string) => {
  await ensureEmployee(staffId);
  const allocations = await StaffRoomAllocationModel.find({ staffId })
    .populate("staffId", "fullName email")
    .populate("roomId", "roomNumber floor")
    .sort({ allocatedAt: -1 })
    .lean();
  return allocations.map(allocationResponse);
};
