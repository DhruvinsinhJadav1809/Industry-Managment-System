import { z } from "zod";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";

export const createEmployeeAssetSchema = z.object({
  name: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(100000),
});

export const assignEmployeeAssetSchema = z.object({
  staffId: objectIdSchema,
  quantity: z.number().int().min(1).max(100000),
});

export const employeeAssetIdParamsSchema = z.object({
  assetId: objectIdSchema,
});

export const employeeAssetAssignmentParamsSchema =
  employeeAssetIdParamsSchema.extend({
    staffId: objectIdSchema,
  });

export const reassignEmployeeAssetSchema = z.object({
  newStaffId: objectIdSchema,
});

export const createEmployeeAssetReleaseRequestSchema = z.object({
  quantity: z.number().int().min(1).max(100000),
  note: z.string().trim().min(1).max(1000),
});

export const employeeAssetReleaseRequestParamsSchema =
  employeeAssetIdParamsSchema.extend({
    requestId: objectIdSchema,
  });

export const reviewEmployeeAssetReleaseRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});
