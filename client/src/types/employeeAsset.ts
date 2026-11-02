export interface EmployeeAssetAssignment {
  staffId: string;
  staffName: string;
  quantity: number;
  assignedAt: string;
}

export type EmployeeAssetReleaseStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface EmployeeAssetReleaseRequest {
  id: string;
  staffId: string;
  staffName: string;
  quantity: number;
  note: string;
  status: EmployeeAssetReleaseStatus;
  createdAt: string;
  reviewedByName: string | null;
  reviewedAt: string | null;
}

export interface EmployeeAsset {
  id: string;
  name: string;
  quantity: number;
  assignedQuantity: number;
  availableQuantity: number;
  assignments: EmployeeAssetAssignment[];
  releaseRequests: EmployeeAssetReleaseRequest[];
  createdAt: string;
  updatedAt: string;
}

export interface MyEmployeeAsset {
  id: string;
  name: string;
  quantity: number;
  releaseRequests: EmployeeAssetReleaseRequest[];
}

export interface CreateEmployeeAssetPayload {
  name: string;
  quantity: number;
}

export interface AssignEmployeeAssetPayload {
  staffId: string;
  quantity: number;
}

export interface CreateEmployeeAssetReleaseRequestPayload {
  quantity: number;
  note: string;
}
