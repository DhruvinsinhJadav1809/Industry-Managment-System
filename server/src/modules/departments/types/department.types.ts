import { Document, Types } from "mongoose";
import { IUserDocument } from "../../users/types/user.types";

export interface IDepartment {
  name: string;
  code: string;
  description?: string;

  managerId: Types.ObjectId;

  isActive: boolean;
  isDeleted: boolean;

  createdAt: Date;
  createdBy?: Types.ObjectId;

  updatedAt?: Date;
  updatedBy?: Types.ObjectId;

  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

export interface IDepartmentDocument extends IDepartment, Document {}

export interface IDepartmentPopulatedDocument extends Omit<
  IDepartmentDocument,
  "managerId"
> {
  managerId?: IUserDocument | null;
}
