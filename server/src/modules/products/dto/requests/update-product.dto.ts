import { ProductUnit } from "../../types/product.types";

export interface UpdateProductDto {
  name: string;
  sku: string;
  departmentId: string;
  description?: string;
  unit: ProductUnit;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
  productCode: string;
}
