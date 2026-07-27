import { ProductUnit } from "../../types/product.types";

export interface CreateProductDto {
  name: string;
  sku: string;
  productCode: string;
  departmentId: string;
  description?: string;
  unit: ProductUnit;
  costPrice: number;
  sellingPrice: number;
}
