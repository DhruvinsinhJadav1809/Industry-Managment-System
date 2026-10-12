import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { validateRequest } from "../../../middleware/validate-request";
import { UserRole } from "../../../shared/enums/user-role.enum";
import * as notificationController from "../controllers/notification.controller";
import {
  createNotificationSchema,
  getNotificationsQuerySchema,
} from "../validations/notification.validation";

const router = Router();

router.get(
  "/",
  authenticate,
  validateRequest(getNotificationsQuerySchema, "query"),
  notificationController.getMyNotifications,
);

router.post(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(createNotificationSchema),
  notificationController.createNotification,
);

export default router;
