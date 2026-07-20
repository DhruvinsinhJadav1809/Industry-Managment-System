import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { validateRequest } from "../../../middleware/validate-request";
import createUserValidation from "../validations/create-user.validation";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { getUsersSchema } from "../validations/get-users.validation";
import { userIdParamsSchema } from "../validations/user-id-params.validation.ts";
import { updateUserSchema } from "../validations/update-user.validation";
const router = Router();

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
