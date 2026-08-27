import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { loginValidation } from "../validations/login.validation";
import { validateRequest } from "../../../middleware/validate-request";
import { forgotPasswordSchema } from "../validations/forgot-password.validation";
import { resetPasswordSchema } from "../validations/reset-password-validation";
import { loginRateLimiter } from "../../../middleware/rate-limit.middleware";

const router = Router();

router.post(
  "/login",
  loginRateLimiter,
  validateRequest(loginValidation),
  authController.login,
);
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  authController.resetPassword,
);
export default router;
