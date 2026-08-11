import { HydratedDocument, Types } from "mongoose";

export interface IPurchaseItem {
  purchaseId: Types.ObjectId;

  productId: Types.ObjectId;

  quantity: number;

  unitPrice: number;

  taxPercentage: number;

  taxAmount: number;

  lineTotal: number;

  createdAt: Date;

  updatedAt: Date;
}

export type IPurchaseItemDocument = HydratedDocument<IPurchaseItem>;
