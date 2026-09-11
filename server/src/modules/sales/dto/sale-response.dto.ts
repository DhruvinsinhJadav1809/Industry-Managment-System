export interface SaleItemResponseDto {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  gstPercentage: number;
  taxAmount: number;
  total: number;
}

export interface SaleResponseDto {
  id: string;
  saleNumber: string;
  invoiceNumber: string;
  saleDate: Date;
  customerName: string;
  customerPhone?: string;
  items: SaleItemResponseDto[];
  subTotal: number;
  discountAmount: number;
  totalTax: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
