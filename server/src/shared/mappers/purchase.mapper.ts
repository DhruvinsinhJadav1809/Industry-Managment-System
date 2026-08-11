import { IPurchaseDocument } from "../../modules/purchase/types/purchase.types";

export const toPurchaseResponseDto = (purchase: IPurchaseDocument) => ({
  id: purchase._id.toString(),

  purchaseNumber: purchase.purchaseNumber,

  supplierId: purchase.supplierId,

  invoiceNumber: purchase.invoiceNumber,

  purchaseDate: purchase.purchaseDate,

  remarks: purchase.remarks,

  subtotal: purchase.subtotal,

  taxAmount: purchase.taxAmount,

  discount: purchase.discount,

  grandTotal: purchase.grandTotal,

  status: purchase.status,

  createdAt: purchase.createdAt,

  updatedAt: purchase.updatedAt,
});
