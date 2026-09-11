export interface SaleItemInput {
  productId: string;
  quantity: number;
  rate: number;
  gstPercentage: number;
}

export interface CreateSalePayload {
  saleDate: string; // ISO datetime
  customerName: string;
  customerPhone: string;
  items: SaleItemInput[];
  discountAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
}

/**
 * Response shape for POST /sales wasn't provided — you only gave the
 * request payload. Loosely modeled so nothing here breaks once you confirm
 * the real shape; tighten this up (and what SaleCreate.tsx reads off it)
 * once you have it.
 */
export interface CreateSaleResult {
  _id?: string;
  saleNumber?: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  grandTotal?: number;
  status?: string;
  [key: string]: unknown;
}
export interface SaleCustomerRef {
  _id: string;
  name: string;
  code: string;
}

/**
 * NOTE: this reveals customers are actually a referenced entity
 * (customerId -> {_id, name, code}, like suppliers), not the free-text
 * customerName/customerPhone the create payload used. The create form
 * still sends customerName/customerPhone since that's the confirmed create
 * contract — but if there's really a Customer entity behind this, the
 * create form should probably use a CustomerPicker instead once you
 * confirm there's a GET /customers endpoint to search against.
 */
export interface SaleListItem {
  _id: string;
  saleNumber: string;
  invoiceNumber: string;
  saleDate: string;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  subTotal: number;
  discountAmount: number;
  totalTax: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  gstPercentage: number;
  taxAmount: number;
  total: number;
}

export interface SaleListPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SaleListData {
  data: SaleListItem[];
  pagination: SaleListPagination;
}

export type SaleSortOrder = "asc" | "desc";

export interface SaleListParams {
  page: number;
  pageSize: number;
  search?: string;
  paymentStatus?: string;
  sortBy?: string;
  sortOrder?: SaleSortOrder;
}
