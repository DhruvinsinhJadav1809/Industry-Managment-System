import { Types } from "mongoose";

export interface CreateSaleItemDto {
  productId: Types.ObjectId;
  quantity: number;
  rate: number;
  gstPercentage: number;
}
