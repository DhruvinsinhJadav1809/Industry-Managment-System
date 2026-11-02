import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { validateRequest } from "../../../middleware/validate-request";
import { UserRole } from "../../../shared/enums/user-role.enum";
import * as employeeAssetController from "./employee-asset.controller";
import {
  assignEmployeeAssetSchema,
  createEmployeeAssetReleaseRequestSchema,
  createEmployeeAssetSchema,
  employeeAssetAssignmentParamsSchema,
  employeeAssetIdParamsSchema,
  employeeAssetReleaseRequestParamsSchema,
  reassignEmployeeAssetSchema,
  reviewEmployeeAssetReleaseRequestSchema,
} from "./employee-asset.validation";

const router = Router();

router.get(
  "/mine",
  authenticate,
  authorize([UserRole.Employee]),
  employeeAssetController.getMyAssets,
);
router.get(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  employeeAssetController.getAssets,
);
router.post(
  "/:assetId/release-requests",
  authenticate,
  authorize([UserRole.Employee]),
  validateRequest(employeeAssetIdParamsSchema, "params"),
  validateRequest(createEmployeeAssetReleaseRequestSchema),
  employeeAssetController.createAssetReleaseRequest,
);
router.patch(
  "/:assetId/release-requests/:requestId",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(employeeAssetReleaseRequestParamsSchema, "params"),
  validateRequest(reviewEmployeeAssetReleaseRequestSchema),
  employeeAssetController.reviewAssetReleaseRequest,
);
router.post(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(createEmployeeAssetSchema),
  employeeAssetController.createAsset,
);
router.post(
  "/:assetId/assign",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(employeeAssetIdParamsSchema, "params"),
  validateRequest(assignEmployeeAssetSchema),
  employeeAssetController.assignAsset,
);
router.patch(
  "/:assetId/assignments/:staffId",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(employeeAssetAssignmentParamsSchema, "params"),
  validateRequest(reassignEmployeeAssetSchema),
  employeeAssetController.reassignAsset,
);
router.delete(
  "/:assetId/assignments/:staffId",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(employeeAssetAssignmentParamsSchema, "params"),
  employeeAssetController.removeAssetAssignment,
);
router.delete(
  "/:assetId",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(employeeAssetIdParamsSchema, "params"),
  employeeAssetController.deleteAsset,
);

export default router;
