import mongoose from "mongoose";

import { NotificationModel } from "../models/notification.model";
import { SendNotificationDto } from "../dtos/notification.dto";
import { socketService } from "../../socket/socket.service";

export const send = async (data: SendNotificationDto) => {
  const notification = await NotificationModel.create({
    title: data.title,

    message: data.message,

    type: data.type,

    recipients: data.recipients.map((userId) => ({
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    })),

    metadata: data.metadata,

    actionUrl: data.actionUrl,

    createdBy: new mongoose.Types.ObjectId(data.createdBy),
  });
  socketService.sendNotification(notification);
  return notification;
};
