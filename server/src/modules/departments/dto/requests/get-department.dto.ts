export interface GetDepartmentsQueryDto {
  page: number;

  pageSize: number;

  search?: string;

  sortBy?: string;

  sortOrder?: "asc" | "desc";
}
