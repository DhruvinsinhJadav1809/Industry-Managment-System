import { HydratedDocument, Types } from "mongoose";

export interface ISupplier {
  name: string;
  code: string;

  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;

  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  isActive: boolean;
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;

  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

export type ISupplierDocument = HydratedDocument<ISupplier>;
