import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import {
  AssignEmployeeAssetDto,
  CreateEmployeeAssetReleaseRequestDto,
  CreateEmployeeAssetDto,
  ReassignEmployeeAssetDto,
  ReviewEmployeeAssetReleaseRequestDto,
} from "./employee-asset.dto";
import * as employeeAssetService from "./employee-asset.service";

export const getAssets = asyncHandler(async (_req, res) => {
  const result = await employeeAssetService.getAssets();
  return res.json(successResponse(result, "Employee assets retrieved."));
});

export const getMyAssets = asyncHandler(async (req, res) => {
  const result = await employeeAssetService.getMyAssets(req.user.id);
  return res.json(successResponse(result, "Your assigned assets retrieved."));
});

export const createAssetReleaseRequest = asyncHandler(async (req, res) => {
  const result = await employeeAssetService.createAssetReleaseRequest(
    String(req.params.assetId),
    req.body as CreateEmployeeAssetReleaseRequestDto,
    req.user.id,
    req.user.fullName,
  );
  return res
    .status(201)
    .json(successResponse(result, "Asset release request submitted."));
});

export const reviewAssetReleaseRequest = asyncHandler(async (req, res) => {
  const result = await employeeAssetService.reviewAssetReleaseRequest(
    String(req.params.assetId),
    String(req.params.requestId),
    req.body as ReviewEmployeeAssetReleaseRequestDto,
    req.user.id,
    req.user.fullName,
  );
  return res.json(successResponse(result, "Asset release request reviewed."));
});

export const createAsset = asyncHandler(async (req, res) => {
  const result = await employeeAssetService.createAsset(
    req.body as CreateEmployeeAssetDto,
    req.user.id,
  );
  return res
    .status(201)
    .json(successResponse(result, "Employee asset created successfully."));
});

export const assignAsset = asyncHandler(async (req, res) => {
  const result = await employeeAssetService.assignAsset(
    String(req.params.assetId),
    req.body as AssignEmployeeAssetDto,
    req.user.id,
  );
  return res.json(successResponse(result, "Asset assigned successfully."));
});

export const reassignAsset = asyncHandler(async (req, res) => {
  const result = await employeeAssetService.reassignAsset(
    String(req.params.assetId),
    String(req.params.staffId),
    req.body as ReassignEmployeeAssetDto,
    req.user.id,
  );
  return res.json(successResponse(result, "Asset assignment reassigned."));
});

export const removeAssetAssignment = asyncHandler(async (req, res) => {
  const result = await employeeAssetService.removeAssetAssignment(
    String(req.params.assetId),
    String(req.params.staffId),
  );
  return res.json(successResponse(result, "Employee asset assignment removed."));
});

export const deleteAsset = asyncHandler(async (req, res) => {
  const result = await employeeAssetService.deleteAsset(
    String(req.params.assetId),
  );
  return res.json(successResponse(result, "Employee asset deleted."));
});
