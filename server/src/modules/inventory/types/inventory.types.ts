import { Document, Types } from "mongoose";
import { IProductDocument } from "../../products/types/product.types";

export interface IInventory {
  productId: Types.ObjectId;
  quantity: number;
  minimumStock: number;
  maximumStock?: number | null;
  location?: string;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId | null;
  deletedBy?: Types.ObjectId | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryDocument extends IInventory, Document {}

export interface IInventoryPopulatedDocument extends Omit<
  IInventory,
  "productId"
> {
  _id: Types.ObjectId;
  id: string;
  productId: IProductDocument;
}
