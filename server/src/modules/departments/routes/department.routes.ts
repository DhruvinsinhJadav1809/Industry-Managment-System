import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { authorize } from "../../../middleware/authorization.middleware";
import { validateRequest } from "../../../middleware/validate-request";
import { createDepartmentSchema } from "../validations/create-department.validation";
import * as departmentController from "../controllers/department.controller";
import { getDepartmentsSchema } from "../validations/get-department.validation";
import { userIdParamsSchema } from "../../users/validations/user-id-params.validation.ts";
import { updateDepartmentSchema } from "../validations/update-manager.validation";
import { objectIdSchema } from "../../../shared/validations/object-id.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(createDepartmentSchema),
  departmentController.createDepartment,
);
router.patch(
  "/:id/manager",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(objectIdSchema),
  departmentController.assignManager,
);
router.get(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(getDepartmentsSchema, "query"),
  departmentController.getDepartments,
);
router.get(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(userIdParamsSchema, "params"),
  departmentController.getDepartmentById,
);
router.put(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(userIdParamsSchema, "params"),
  validateRequest(updateDepartmentSchema),
  departmentController.updateDepartment,
);
router.delete(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(userIdParamsSchema, "params"),
  departmentController.deleteDepartment,
);

export default router;
