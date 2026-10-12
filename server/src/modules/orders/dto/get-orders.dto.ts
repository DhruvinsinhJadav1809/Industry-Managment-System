import { OrderStatus } from "../constants/order-status.enum";

export interface GetOrdersQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "createdAt" | "orderNumber" | "status";
  sortOrder?: "asc" | "desc";
  status?: OrderStatus;
}
