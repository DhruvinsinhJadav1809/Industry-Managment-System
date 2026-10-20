import { z } from "zod";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";
import { StaffRoomStatus } from "../types/staff-room.types";

const roomNumberSchema = z
  .string()
  .trim()
  .min(1)
  .max(30)
  .transform((value) => value.toUpperCase());
const floorSchema = z.string().trim().min(1).max(50);
const capacitySchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);

export const roomIdSchema = z.object({ roomId: objectIdSchema });
export const staffRoomStaffIdSchema = z.object({ staffId: objectIdSchema });

export const createStaffRoomSchema = z.object({
  roomNumber: roomNumberSchema,
  floor: floorSchema,
  capacity: capacitySchema,
});

export const updateStaffRoomSchema = z
  .object({
    roomNumber: roomNumberSchema.optional(),
    floor: floorSchema.optional(),
    capacity: capacitySchema.optional(),
    status: z.enum(StaffRoomStatus).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one room field must be provided.",
  });

export const allocateStaffRoomSchema = z.object({
  staffIds: z
    .array(objectIdSchema)
    .min(1)
    .refine(
      (staffIds) => new Set(staffIds).size === staffIds.length,
      "Staff IDs must be unique.",
    ),
});

export const transferStaffRoomSchema = z.object({ roomId: objectIdSchema });
