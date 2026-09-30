export interface ProductProfitabilityDto {
  productId: string;
  productName: string;
  departmentName: string;

  soldQuantity: number;
  salesAmount: number;

  purchaseQuantity: number;
  purchaseCost: number;

  profit: number;
  profitMargin: number;
}

export interface ProductProfitabilityResponseDto {
  products: ProductProfitabilityDto[];
}
