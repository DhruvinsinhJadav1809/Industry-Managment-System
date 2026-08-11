export interface PurchaseItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
}

export interface CreatePurchasePayload {
  supplierId: string;
  invoiceNumber: string;
  purchaseDate: string; // yyyy-mm-dd
  remarks?: string;
  discount?: number;
  items: PurchaseItemInput[];
}

/** Shape returned by POST /purchases — supplierId stays a plain id here, not populated. */
export interface CreatePurchaseResult {
  _id: string;
  purchaseNumber: string;
  supplierId: string;
  invoiceNumber: string;
  purchaseDate: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  status: string;
}

export interface PurchaseSupplierRef {
  _id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
}

export interface PurchaseProductRef {
  _id: string;
  name: string;
  code: string;
}

/** Row shape from GET /purchases — supplierId is populated, no line items. */
export interface PurchaseListItem {
  _id: string;
  purchaseNumber: string;
  supplierId: PurchaseSupplierRef;
  grandTotal: number;
  status: string;
  purchaseDate: string;
}

export interface PurchaseLineItem {
  _id: string;
  productId: PurchaseProductRef;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  taxAmount: number;
  lineTotal: number;
}

/** Shape returned by GET /purchases/:id — fully populated, with line items. */
export interface PurchaseDetail {
  _id: string;
  purchaseNumber: string;
  supplierId: PurchaseSupplierRef;
  invoiceNumber: string;
  purchaseDate: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  status: string;
  items: PurchaseLineItem[];
  remarks?: string;
}

/**
 * GET /purchases uses a different envelope than the rest of the app's list
 * endpoints: `data.data` (not `data.items`) and `data.pagination` (not flat
 * page/pageSize/totalRecords/totalPages).
 */
export interface PurchaseListPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PurchaseListData {
  data: PurchaseListItem[];
  pagination: PurchaseListPagination;
}

export type PurchaseSortOrder = "asc" | "desc";

export interface PurchaseListParams {
  page: number;
  pageSize: number;
  search?: string;
  supplierId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: PurchaseSortOrder;
}
