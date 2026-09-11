export interface CreateSaleDto {
  saleDate: Date;
  customerName: string;
  customerPhone?: string;
  items: CreateSaleItemDto[];
  discountAmount?: number;
  paymentMethod: "CASH" | "BANK" | "UPI" | "CARD";
  paymentStatus?: "PAID" | "PARTIAL" | "PENDING";
  notes?: string;
}

export interface CreateSaleItemDto {
  productId: string;
  quantity: number;
  rate: number;
  gstPercentage: number;
}
