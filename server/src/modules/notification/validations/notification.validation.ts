import { z } from "zod";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";
import { NotificationType } from "../enums/notification-type.enum";

export const createNotificationSchema = z.object({
  title: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(2000),
  type: z.enum(NotificationType),
  recipients: z.array(objectIdSchema).min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
  actionUrl: z.string().trim().min(1).optional(),
});

export const getNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
