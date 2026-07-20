export interface GetUsersQueryDto {
  page: number;
  pageSize: number;
  search?: string;
  roleId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
