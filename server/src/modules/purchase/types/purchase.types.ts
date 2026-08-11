import { HydratedDocument, Types } from "mongoose";
import { PurchaseStatus } from "../constants/purchase-status.enum";

export interface IPurchase {
  purchaseNumber: string;

  supplierId: Types.ObjectId;

  invoiceNumber?: string;

  purchaseDate: Date;

  remarks?: string;

  subtotal: number;

  taxAmount: number;

  discount: number;

  grandTotal: number;

  status: PurchaseStatus;

  isDeleted: boolean;

  createdBy: Types.ObjectId;

  updatedBy?: Types.ObjectId;

  deletedBy?: Types.ObjectId;

  deletedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

export type IPurchaseDocument = HydratedDocument<IPurchase>;
