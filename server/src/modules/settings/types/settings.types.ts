import { HydratedDocument, Types } from "mongoose";

export interface ISettings {
  companyName: string;

  gstNumber: string;

  logoUrl?: string;

  email?: string;

  phone?: string;

  address?: string;

  city?: string;

  state?: string;

  country?: string;

  postalCode?: string;

  createdAt: Date;
  updatedAt: Date;

  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export type ISettingsDocument = HydratedDocument<ISettings>;
