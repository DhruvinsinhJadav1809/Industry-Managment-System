export interface CreateEmployeeAssetDto {
  name: string;
  quantity: number;
}

export interface AssignEmployeeAssetDto {
  staffId: string;
  quantity: number;
}

export interface ReassignEmployeeAssetDto {
  newStaffId: string;
}

export interface CreateEmployeeAssetReleaseRequestDto {
  quantity: number;
  note: string;
}

export interface ReviewEmployeeAssetReleaseRequestDto {
  status: "APPROVED" | "REJECTED";
}

export interface EmployeeAssetIdParamsDto {
  assetId: string;
}

export interface EmployeeAssetAssignmentParamsDto {
  assetId: string;
  staffId: string;
}

export interface EmployeeAssetReleaseRequestParamsDto {
  assetId: string;
  requestId: string;
}
