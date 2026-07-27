import { HydratedDocument, Types } from "mongoose";
import { IDepartmentDocument } from "../../departments/types/department.types";

export enum ProductUnit {
  Piece = "Piece",
  Box = "Box",
  Kg = "Kg",
  Meter = "Meter",
}

export interface IProduct {
  name: string;
  sku: string;
  productCode: string;
  departmentId: Types.ObjectId;

  description?: string;

  unit: ProductUnit;

  costPrice: number;

  sellingPrice: number;

  isActive: boolean;

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;

  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

export type IProductDocument = HydratedDocument<IProduct>;

export interface IProductPopulatedDocument extends Omit<
  IProductDocument,
  "departmentId"
> {
  departmentId: IDepartmentDocument;
}
