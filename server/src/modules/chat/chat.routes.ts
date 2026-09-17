import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorization.middleware";
import { UserRole } from "../../shared/enums/user-role.enum";
import * as ChatController from "./chat.controller";
import { validateRequest } from "../../middleware/validate-request";
import { chatRequestSchema } from "./chat.schema";
import { chatRateLimiter } from "../../middleware/rate-limit.middleware";

const router = Router();

router.post(
  "/",
  chatRateLimiter,
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(chatRequestSchema),
  ChatController.chat,
);

export default router;
