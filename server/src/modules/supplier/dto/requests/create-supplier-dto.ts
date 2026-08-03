export interface CreateSupplierDto {
  name: string;
  code: string;

  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;

  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}
