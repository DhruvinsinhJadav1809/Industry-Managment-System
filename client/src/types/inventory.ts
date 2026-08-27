export interface InventoryProductRef {
  id: string;
  name: string;
  code: string;
}

export interface InventoryItem {
  id: string;
  product: InventoryProductRef;
  quantity: number;
  minimumStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryListData {
  items: InventoryItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface InventoryListParams {
  page: number;
  pageSize: number;
}
