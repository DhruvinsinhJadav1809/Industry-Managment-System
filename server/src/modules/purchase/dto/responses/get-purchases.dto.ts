export interface GetPurchasesQueryDto {
  page?: number;

  pageSize?: number;

  search?: string;

  sortBy?: string;

  sortOrder?: "asc" | "desc";

  status?: string;

  supplierId?: string;
}
