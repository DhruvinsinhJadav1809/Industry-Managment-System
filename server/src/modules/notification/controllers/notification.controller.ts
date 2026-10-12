import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import * as notificationService from "../services/notification.service";
import { SendNotificationDto } from "../dtos/notification.dto";

export const createNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.send({
    ...(req.body as Omit<SendNotificationDto, "createdBy">),
    createdBy: req.user.id,
  });

  return res
    .status(201)
    .json(successResponse(notification, "Notification created successfully."));
});

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getForUser(
    req.user.id,
    res.locals.validated,
  );
  return res.json(successResponse(notifications));
});
