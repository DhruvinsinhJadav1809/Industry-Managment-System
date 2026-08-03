import { SupplierResponseDto } from "../../modules/supplier/dto/responses/supplier-response-dto";
import { ISupplierDocument } from "../../modules/supplier/types/supplier.types";

export const toSupplierResponseDto = (
  supplier: ISupplierDocument,
): SupplierResponseDto => ({
  id: supplier.id,

  name: supplier.name,
  code: supplier.code,

  contactPerson: supplier.contactPerson,
  email: supplier.email,
  phone: supplier.phone,
  gstNumber: supplier.gstNumber,

  address: supplier.address,
  city: supplier.city,
  state: supplier.state,
  country: supplier.country,
  postalCode: supplier.postalCode,

  isActive: supplier.isActive,

  createdAt: supplier.createdAt,
  updatedAt: supplier.updatedAt,
});
