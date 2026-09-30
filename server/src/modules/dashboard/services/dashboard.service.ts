import mongoose from "mongoose";
import { getCurrentFinancialYear } from "../../../shared/helpers/get-current-year";
import { PurchaseModel } from "../../purchase/schema/purchase.schema";
import { SaleModel } from "../../sales/schema/sales.schema";
import { FinancialSummaryDto } from "../dto/financial-summary.dto";
import {
  ProductProfitabilityDto,
  ProductProfitabilityResponseDto,
} from "../dto/report.dto";
import { ProductModel } from "../../products/schemas/product.model";
import { PurchaseItemModel } from "../../purchase/schema/purchase-item.schema";

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
          paymentStatus: "PAID",
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

export const getProductProfitability =
  async (): Promise<ProductProfitabilityResponseDto> => {
    const [purchaseResult, salesResult] = await Promise.all([
      PurchaseItemModel.aggregate([
        {
          $lookup: {
            from: "purchases",
            localField: "purchaseId",
            foreignField: "_id",
            as: "purchase",
          },
        },
        {
          $unwind: "$purchase",
        },
        {
          $match: {
            "purchase.isDeleted": false,
            "purchase.status": "Completed",
          },
        },
        {
          $group: {
            _id: "$productId",
            purchaseQuantity: {
              $sum: {
                $ifNull: ["$quantity", 0],
              },
            },
            purchaseCost: {
              $sum: {
                $multiply: [
                  { $ifNull: ["$quantity", 0] },
                  { $ifNull: ["$unitPrice", 0] },
                ],
              },
            },
          },
        },
      ]),

      SaleModel.aggregate([
        {
          $match: {
            isDeleted: false,
            paymentStatus: "PAID",
          },
        },
        {
          $unwind: "$items",
        },
        {
          $set: {
            lineAmount: {
              $multiply: [
                { $ifNull: ["$items.quantity", 0] },
                { $ifNull: ["$items.rate", 0] },
              ],
            },
          },
        },
        {
          $set: {
            discountAmount: {
              $cond: [
                {
                  $gt: [{ $ifNull: ["$subTotal", 0] }, 0],
                },
                {
                  $multiply: [
                    {
                      $divide: ["$lineAmount", { $ifNull: ["$subTotal", 0] }],
                    },
                    { $ifNull: ["$discountAmount", 0] },
                  ],
                },
                0,
              ],
            },
          },
        },
        {
          $set: {
            netSalesAmount: {
              $subtract: ["$lineAmount", "$discountAmount"],
            },
          },
        },
        {
          $group: {
            _id: "$items.productId",
            soldQuantity: {
              $sum: {
                $ifNull: ["$items.quantity", 0],
              },
            },
            salesAmount: {
              $sum: {
                $ifNull: ["$netSalesAmount", 0],
              },
            },
          },
        },
      ]),
    ]);

    const productIds = [
      ...purchaseResult.map((item) => item._id.toString()),
      ...salesResult.map((item) => item._id.toString()),
    ];

    const uniqueProductIds = [...new Set(productIds)];

    if (uniqueProductIds.length === 0) {
      return {
        products: [],
      };
    }

    const products = await ProductModel.find({
      _id: {
        $in: uniqueProductIds,
      },
      isDeleted: false,
    })
      .populate("departmentId", "name")
      .lean();

    const purchaseMap = new Map(
      purchaseResult.map((item) => [
        item._id.toString(),
        {
          purchaseQuantity: Number(item.purchaseQuantity ?? 0),
          purchaseCost: Number(item.purchaseCost ?? 0),
        },
      ]),
    );

    const salesMap = new Map(
      salesResult.map((item) => [
        item._id.toString(),
        {
          soldQuantity: Number(item.soldQuantity ?? 0),
          salesAmount: Number(item.salesAmount ?? 0),
        },
      ]),
    );

    const profitability: ProductProfitabilityDto[] = products.map((product) => {
      const productId = product._id.toString();

      const purchase = purchaseMap.get(productId);
      const sales = salesMap.get(productId);

      const purchaseQuantity = purchase?.purchaseQuantity ?? 0;
      const purchaseCost = purchase?.purchaseCost ?? 0;

      const soldQuantity = sales?.soldQuantity ?? 0;
      const salesAmount = sales?.salesAmount ?? 0;

      const averagePurchaseCost =
        purchaseQuantity > 0 ? purchaseCost / purchaseQuantity : 0;

      const costOfGoodsSold = soldQuantity * averagePurchaseCost;

      const profit = salesAmount - costOfGoodsSold;

      const profitMargin = salesAmount > 0 ? (profit / salesAmount) * 100 : 0;

      const department = product.departmentId as unknown as {
        _id: mongoose.Types.ObjectId;
        name: string;
      } | null;

      return {
        productId,
        productName: product.name,
        departmentName: department?.name ?? "N/A",

        soldQuantity,
        salesAmount,

        purchaseQuantity,
        purchaseCost,

        profit,
        profitMargin,
      };
    });

    profitability.sort((a, b) => b.profit - a.profit);

    return {
      products: profitability,
    };
  };
