export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  roleId: number;
  imageUrl: string | null;
  isActive: boolean;
}

export interface UserListData {
  items: UserListItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export type SortOrder = "asc" | "desc";

export interface UserListParams {
  page: number;
  pageSize: number;
  search?: string;
  roleId?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

/**
 * Payload for updating a user. Endpoint/shape assumed as
 * PATCH /users/:id — adjust in userService.ts once confirmed.
 */
export interface UpdateUserPayload {
  fullName: string;
  email: string;
  roleId: number;
  isActive: boolean;
}
