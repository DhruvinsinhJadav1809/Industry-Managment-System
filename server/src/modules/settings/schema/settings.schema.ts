import { Schema, model } from "mongoose";
import { ISettingsDocument } from "../types/settings.types";

const settingsSchema = new Schema<ISettingsDocument>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    gstNumber: {
      type: String,
      required: true,
      trim: true,
    },

    logoUrl: String,

    email: String,

    phone: String,

    address: String,

    city: String,

    state: String,

    country: String,

    postalCode: String,

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const SettingsModel = model<ISettingsDocument>(
  "Settings",
  settingsSchema,
);
