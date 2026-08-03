export interface SupplierResponseDto {
  id: string;

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

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}
