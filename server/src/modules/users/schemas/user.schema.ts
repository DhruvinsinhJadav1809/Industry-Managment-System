import { Schema, model } from "mongoose";
import { IUser } from "../types/user.types";

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    roleId: {
      type: Number,
      required: true,
      default: 2,
    },

    imageUrl: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
const UserModel = model<IUser>("User", userSchema);

export default UserModel;
