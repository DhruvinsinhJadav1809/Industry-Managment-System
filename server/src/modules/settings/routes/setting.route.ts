import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { validateRequest } from "../../../middleware/validate-request";
import { createSettingsSchema } from "../validations/create-settings.validation";
import { updateSettingsSchema } from "../validations/update-settings.validation";
import * as settingsController from "../controller/settings-controller";
import { uploadLogo } from "../../../shared/upload/multer";
const router = Router();
router.get(
  "/",
  authenticate,
  authorize([UserRole.Admin, UserRole.Employee]),
  settingsController.getSettings,
);

router.post(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(createSettingsSchema),
  settingsController.createSettings,
);

router.put(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(updateSettingsSchema),
  settingsController.updateSettings,
);
router.post(
  "/logo",
  authenticate,
  authorize([UserRole.Admin]),
  uploadLogo.single("logo"),
  settingsController.uploadLogo,
);
export default router;
