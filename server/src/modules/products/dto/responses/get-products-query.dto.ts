export interface GetProductsQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
