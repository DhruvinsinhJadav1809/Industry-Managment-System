export interface PurchaseItemDto {
  productId: string;

  quantity: number;

  unitPrice: number;

  taxPercentage: number;
}

export interface CreatePurchaseDto {
  supplierId: string;

  invoiceNumber?: string;

  purchaseDate: Date;

  remarks?: string;

  discount?: number;

  items: PurchaseItemDto[];
}
