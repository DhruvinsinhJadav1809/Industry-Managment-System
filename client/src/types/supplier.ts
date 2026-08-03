export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierListData {
  items: Supplier[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface SupplierListParams {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateSupplierPayload {
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

/** PUT /suppliers/:id accepts a partial update — send only changed fields. */
export type UpdateSupplierPayload = Partial<CreateSupplierPayload> & {
  isActive?: boolean;
};
