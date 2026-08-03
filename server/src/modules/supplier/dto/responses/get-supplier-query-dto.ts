export interface GetSuppliersQueryDto {
  page?: number;
  pageSize?: number;

  search?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";

  isActive?: boolean;
}
