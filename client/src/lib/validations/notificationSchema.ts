import { z } from "zod";
import { NOTIFICATION_TYPES } from "../../types/notification";

export const createNotificationSchema = z.object({
  title: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(2000),
  type: z.enum(NOTIFICATION_TYPES),
  recipients: z.array(z.string().min(1)).min(1),
});
