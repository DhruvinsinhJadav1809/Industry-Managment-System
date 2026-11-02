import { NextFunction, Request, Response, Router } from "express";
import * as userController from "../controllers/user.controller";
import { validateRequest } from "../../../middleware/validate-request";
import createUserValidation from "../validations/create-user.validation";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { getUsersSchema } from "../validations/get-users.validation";
import { userIdParamsSchema } from "../validations/user-id-params.validation.ts";
import { updateUserSchema } from "../validations/update-user.validation";
import * as userInvitationController from "../controllers/user-invitation.controller";
import {
  confirmBulkInvitationsSchema,
  inviteUserSchema,
} from "../validations/invite-user.validation";
import multer from "multer";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const uploadSpreadsheet = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.single("file")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new BadRequestError("Excel files must be 5 MB or smaller."));
      return;
    }
    next(new BadRequestError("Could not read the uploaded Excel file."));
  });
};

router.post(
  "/invite",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(inviteUserSchema),
  userInvitationController.inviteUserController,
);

router.get(
  "/bulk/template",
  authenticate,
  authorize([UserRole.Admin]),
  userInvitationController.downloadUserTemplateController,
);

router.post(
  "/bulk/preview",
  authenticate,
  authorize([UserRole.Admin]),
  uploadSpreadsheet,
  userInvitationController.previewBulkInvitationsController,
);

router.post(
  "/bulk/confirm",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(confirmBulkInvitationsSchema),
  userInvitationController.confirmBulkInvitationsController,
);

router.post(
  "/",
  validateRequest(createUserValidation),
  userController.createUser,
);

router.get(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(getUsersSchema, "query"),
  userController.getUsers,
);

router.put(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(userIdParamsSchema, "params"),
  validateRequest(updateUserSchema, "body"),
  userController.updateUser,
);

router.delete(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(userIdParamsSchema, "params"),
  userController.deleteUser,
);

router.get(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(userIdParamsSchema, "params"),
  userController.getUserById,
);
export default router;
