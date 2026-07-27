import { HydratedDocument, Types } from "mongoose";

export interface IUser {
  fullName: string;
  email: string;
  password: string;
  roleId: number;
  imageUrl?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  deletedAt?: Date;
  deletedBy?: Types.ObjectId;

  resetPasswordToken?: string | null;

  resetPasswordExpiresAt?: Date | null;
}
export type IUserDocument = HydratedDocument<IUser>;
