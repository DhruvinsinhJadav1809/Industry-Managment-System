export interface PaginatedResponseDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
