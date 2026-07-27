export interface ProductResponseDto {
  id: string;
  name: string;
  sku: string;
  productCode: string;
  department: {
    id: string;
    name: string;
    code: string;
  };

  description?: string;

  unit: string;

  costPrice: number;

  sellingPrice: number;

  isActive: boolean;
}
