export interface DepartmentManager {
  id: string;
  fullName: string;
  email: string;
}

/**
 * Shape returned by POST /departments and PATCH /departments/:id/manager
 * (managerId only — no populated manager object yet).
 */
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  managerId?: string | null;
  manager?: DepartmentManager | null;
  isActive: boolean;
}

/**
 * Shape returned by GET /departments — manager is populated.
 */
export interface DepartmentListItem {
  id: string;
  name: string;
  code: string;
  description: string;
  manager: DepartmentManager | null;
  isActive: boolean;
}

export interface DepartmentListData {
  items: DepartmentListItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export type SortOrder = "asc" | "desc";

export interface DepartmentListParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description: string;
  managerId?: string;
}

/**
 * Payload for PUT/PATCH /departments/:id.
 * managerId is intentionally excluded — that's handled by the separate
 * PATCH /departments/:id/manager endpoint.
 */
export interface UpdateDepartmentPayload {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface AssignManagerPayload {
  managerId: string;
}
