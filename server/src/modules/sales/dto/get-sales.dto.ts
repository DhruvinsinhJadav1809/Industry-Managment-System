export interface GetSalesQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: "PAID" | "PARTIAL" | "PENDING";
}
