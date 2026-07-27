export interface ProductDepartmentRef {
  id: string;
  name: string;
  code: string;
}

/** Shape returned by POST /products */
export interface Product {
  id: string;
  name: string;
  sku: string;
  productCode?: string;
  department: ProductDepartmentRef;
  description: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  /** Mirrors sku for now — sent as its own field since the API expects it separately. */
  productCode: string;
  departmentId: string;
  description: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
}

/**
 * Shape returned by GET /products and GET /products/:id.
 * Assumed to follow the same list envelope as /departments and /users —
 * update this if the real response differs.
 */
export type ProductListItem = Product;

export interface ProductListData {
  items: ProductListItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export type SortOrder = "asc" | "desc";

export interface ProductListParams {
  page: number;
  pageSize: number;
  search?: string;
  departmentId?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

/** Payload for PUT /products/:id. */
export interface UpdateProductPayload {
  name: string;
  sku: string;
  productCode: string;
  departmentId: string;
  description: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
}
