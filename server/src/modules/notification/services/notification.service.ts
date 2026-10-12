import mongoose from "mongoose";

import { NotificationModel } from "../models/notification.model";
import { SendNotificationDto } from "../dtos/notification.dto";
import { socketService } from "../../socket/socket.service";
import { GetNotificationsQueryDto } from "../dtos/notification.dto";

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

export const getForUser = async (
  userId: string,
  query: GetNotificationsQueryDto,
) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const filter = {
    isDeleted: false,
    "recipients.userId": userObjectId,
  };
  const [notifications, totalRecords] = await Promise.all([
    NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.pageSize)
      .limit(query.pageSize)
      .lean(),
    NotificationModel.countDocuments(filter),
  ]);

  return {
    items: notifications.map((notification) => {
      const recipient = notification.recipients.find(
        (entry) => entry.userId.toString() === userId,
      );
      return {
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        metadata: notification.metadata,
        actionUrl: notification.actionUrl,
        createdAt: notification.createdAt,
        isRead: recipient?.isRead ?? false,
      };
    }),
    page: query.page,
    pageSize: query.pageSize,
    totalRecords,
    totalPages: Math.ceil(totalRecords / query.pageSize),
  };
};
