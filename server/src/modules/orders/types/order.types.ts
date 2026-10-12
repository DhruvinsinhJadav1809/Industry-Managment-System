import { HydratedDocument, Types } from "mongoose";
import { OrderStatus } from "../constants/order-status.enum";

export interface IOrderItem {
  productId: Types.ObjectId;
  requestedQuantity: number;
  approvedQuantity: number;
  unitPrice: number;
}

export interface IOrder {
  orderNumber: string;
  customerId: Types.ObjectId;
  status: OrderStatus;
  items: IOrderItem[];
  stockReserved: boolean;
  saleId?: Types.ObjectId;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IOrderDocument = HydratedDocument<IOrder>;
