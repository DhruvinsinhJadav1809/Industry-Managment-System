import { Document, Types } from "mongoose";

export interface ISaleItem {
  productId: Types.ObjectId;
  productName: string;
  quantity: number;
  rate: number;
  gstPercentage: number;
  taxAmount: number;
  total: number;
}

export interface ISale {
  saleNumber: string;
  invoiceNumber: string;
  saleDate: Date;

  customerName: string;
  customerPhone?: string;

  items: ISaleItem[];

  subTotal: number;
  discountAmount: number;
  totalTax: number;
  grandTotal: number;

  paymentMethod: "CASH" | "BANK" | "UPI" | "CARD";
  paymentStatus: "PAID" | "PARTIAL" | "PENDING";

  notes?: string;

  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  isDeleted: boolean;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type ISaleDocument = ISale & Document;
