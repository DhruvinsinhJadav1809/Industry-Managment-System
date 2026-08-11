import { Types } from "mongoose";
import { NotificationType } from "../enums/notification-type.enum";

export interface INotificationRecipient {
  userId: Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
}

export interface INotification {
  title: string;
  message: string;
  type: NotificationType;

  recipients: INotificationRecipient[];

  metadata?: Record<string, any>;

  actionUrl?: string;

  createdBy: Types.ObjectId;

  createdAt?: Date;

  isDeleted?: boolean;
}
