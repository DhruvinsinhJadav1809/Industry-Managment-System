import {
  SaleItemResponseDto,
  SaleResponseDto,
} from "../../modules/sales/dto/sale-response.dto";
import { ISaleDocument } from "../../modules/sales/types/sales.types";

export const toSaleResponseDto = (sale: ISaleDocument): SaleResponseDto => {
  return {
    id: sale._id.toString(),

    saleNumber: sale.saleNumber,
    invoiceNumber: sale.invoiceNumber,
    saleDate: sale.saleDate,

    customerName: sale.customerName,
    customerPhone: sale.customerPhone,

    items: sale.items.map(
      (item): SaleItemResponseDto => ({
        productId: item.productId.toString(),
        productName: item.productName,
        quantity: item.quantity,
        rate: item.rate,
        gstPercentage: item.gstPercentage,
        taxAmount: item.taxAmount,
        total: item.total,
      }),
    ),

    subTotal: sale.subTotal,
    discountAmount: sale.discountAmount,
    totalTax: sale.totalTax,
    grandTotal: sale.grandTotal,

    paymentMethod: sale.paymentMethod,
    paymentStatus: sale.paymentStatus,

    notes: sale.notes,

    createdBy: sale.createdBy.toString(),

    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
  };
};
