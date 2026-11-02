import { HydratedDocument, Types } from "mongoose";

export interface IEmployeeAssetAssignment {
  staffId: Types.ObjectId;
  quantity: number;
  assignedAt: Date;
  assignedBy: Types.ObjectId;
}

export const EMPLOYEE_ASSET_RELEASE_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;
export type EmployeeAssetReleaseStatus =
  (typeof EMPLOYEE_ASSET_RELEASE_STATUSES)[number];

export interface IEmployeeAssetReleaseRequest {
  _id: Types.ObjectId;
  staffId: Types.ObjectId;
  staffName: string;
  quantity: number;
  note: string;
  status: EmployeeAssetReleaseStatus;
  createdAt: Date;
  reviewedBy: Types.ObjectId | null;
  reviewedByName: string | null;
  reviewedAt: Date | null;
}

export interface IEmployeeAsset {
  name: string;
  quantity: number;
  assignments: IEmployeeAssetAssignment[];
  releaseRequests: IEmployeeAssetReleaseRequest[];
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IEmployeeAssetDocument = HydratedDocument<IEmployeeAsset>;

export interface EmployeeAssetAssignmentDto {
  staffId: string;
  staffName: string;
  quantity: number;
  assignedAt: Date;
}

export interface EmployeeAssetReleaseRequestDto {
  id: string;
  staffId: string;
  staffName: string;
  quantity: number;
  note: string;
  status: EmployeeAssetReleaseStatus;
  createdAt: Date;
  reviewedByName: string | null;
  reviewedAt: Date | null;
}

export interface EmployeeAssetDto {
  id: string;
  name: string;
  quantity: number;
  assignedQuantity: number;
  availableQuantity: number;
  assignments: EmployeeAssetAssignmentDto[];
  releaseRequests: EmployeeAssetReleaseRequestDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MyEmployeeAssetDto {
  id: string;
  name: string;
  quantity: number;
  releaseRequests: EmployeeAssetReleaseRequestDto[];
}
