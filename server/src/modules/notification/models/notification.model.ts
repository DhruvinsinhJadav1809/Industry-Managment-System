import { Schema, model } from "mongoose";
import { INotification } from "../interfaces/notification.interface";

const recipientSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
    },

    recipients: {
      type: [recipientSchema],
      required: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },

    actionUrl: {
      type: String,
      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
  },
);

notificationSchema.index({
  "recipients.userId": 1,
});

notificationSchema.index({
  type: 1,
});

notificationSchema.index({
  createdAt: -1,
});

export const NotificationModel = model<INotification>(
  "Notification",
  notificationSchema,
);
