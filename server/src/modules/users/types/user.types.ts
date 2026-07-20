import { HydratedDocument } from "mongoose";

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
}
export type IUserDocument = HydratedDocument<IUser>;
