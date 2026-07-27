import { ProductResponseDto } from "../../modules/products/dto/responses/product-response.dto";
import { IProductPopulatedDocument } from "../../modules/products/types/product.types";

export const toProductResponseDto = (
  product: IProductPopulatedDocument,
): ProductResponseDto => ({
  id: product._id.toString(),

  name: product.name,

  sku: product.sku,
  productCode: product.productCode,
  department: {
    id: product.departmentId._id.toString(),
    name: product.departmentId.name,
    code: product.departmentId.code,
  },

  description: product.description,

  unit: product.unit,

  costPrice: product.costPrice,

  sellingPrice: product.sellingPrice,

  isActive: product.isActive,
});
