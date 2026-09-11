import { getCurrentFinancialYear } from "../../../shared/helpers/get-current-year";
import { PurchaseModel } from "../../purchase/schema/purchase.schema";
import { SaleModel } from "../../sales/schema/sales.schema";
import { FinancialSummaryDto } from "../dto/financial-summary.dto";

export const getFinancialSummary = async (): Promise<FinancialSummaryDto> => {
  const { start, end, label } = getCurrentFinancialYear();

  const [purchaseResult, salesResult] = await Promise.all([
    PurchaseModel.aggregate([
      {
        $match: {
          isDeleted: false,
          purchaseDate: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,
          subtotal: {
            $sum: "$subtotal",
          },
          tax: {
            $sum: "$taxAmount",
          },
          total: {
            $sum: "$grandTotal",
          },
        },
      },
    ]),

    SaleModel.aggregate([
      {
        $match: {
          isDeleted: false,
          saleDate: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,
          subtotal: {
            $sum: "$subTotal",
          },
          tax: {
            $sum: "$totalTax",
          },
          total: {
            $sum: "$grandTotal",
          },
        },
      },
    ]),
  ]);

  const purchase = purchaseResult[0] ?? {
    subtotal: 0,
    tax: 0,
    total: 0,
  };

  const sales = salesResult[0] ?? {
    subtotal: 0,
    tax: 0,
    total: 0,
  };

  return {
    financialYear: label,

    purchase: {
      subtotal: purchase.subtotal,
      tax: purchase.tax,
      total: purchase.total,
    },

    sales: {
      subtotal: sales.subtotal,
      tax: sales.tax,
      total: sales.total,
    },

    profit: {
      grossProfit: sales.subtotal - purchase.subtotal,
    },

    tax: {
      purchaseTax: purchase.tax,
      salesTax: sales.tax,
      netTax: sales.tax + purchase.tax,
    },
  };
};
