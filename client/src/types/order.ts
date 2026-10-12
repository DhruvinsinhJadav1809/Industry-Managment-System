export type OrderStatus = "PENDING" | "APPROVED" | "BILLED" | "CANCELLED";

export interface OrderProductRef {
  _id: string;
  name: string;
  sku?: string;
  productCode?: string;
}

export interface OrderCustomerRef {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
}

export interface OrderItem {
  productId: string | OrderProductRef;
  requestedQuantity: number;
  approvedQuantity: number;
  unitPrice: number;
  productName?: string;
  productCode?: string;
}

export interface CustomerOrder {
  _id: string;
  orderNumber: string;
  customerId: string | OrderCustomerRef;
  customerName?: string;
  customerPhone?: string;
  status: OrderStatus;
  items: OrderItem[];
  saleId?: string;
  createdAt: string;
}

export interface OrderListData {
  items: CustomerOrder[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface OrderSummaryData {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  billedOrders: number;
  cancelledOrders: number;
  statusCounts: Record<OrderStatus, number>;
}

export interface OrderListParams {
  page: number;
  pageSize: number;
  status?: OrderStatus;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface AcceptOrderItemInput {
  productId: string;
  approvedQuantity: number;
}
