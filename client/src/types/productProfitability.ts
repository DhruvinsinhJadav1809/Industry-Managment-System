export interface ProductProfitabilityItem {
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

export interface ProductProfitabilityData {
  products: ProductProfitabilityItem[];
}
