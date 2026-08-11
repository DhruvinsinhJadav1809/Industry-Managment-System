import { PurchaseItemDto } from "./create-purchase.dto";

export interface UpdatePurchaseDto {
  supplierId: string;

  invoiceNumber?: string;

  purchaseDate: Date;

  remarks?: string;

  discount?: number;

  items: PurchaseItemDto[];
}
