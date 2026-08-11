import { NotificationType } from "../enums/notification-type.enum";

export interface SendNotificationDto {
  title: string;

  message: string;

  type: NotificationType;

  recipients: string[];

  metadata?: Record<string, any>;

  actionUrl?: string;

  createdBy: string;
}
