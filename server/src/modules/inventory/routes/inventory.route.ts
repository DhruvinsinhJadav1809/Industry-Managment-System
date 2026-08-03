import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { validateRequest } from "../../../middleware/validate-request";
import * as inventoryController from "../controller/inventory.controller";
import { userIdParamsSchema } from "../../users/validations/user-id-params.validation.ts";
import { updateInventorySchema } from "../validations/update-inventory.schema";
import { getInventoryQuerySchema } from "../validations/get-inventory.schema";
import { adjustInventorySchema } from "../validations/adjust-inventory.schema";
const router = Router();
router.get(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(getInventoryQuerySchema, "query"),
  inventoryController.getInventories,
);
router.get(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(userIdParamsSchema, "params"),
  inventoryController.getInventoryById,
);
router.put(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(userIdParamsSchema, "params"),
  validateRequest(updateInventorySchema),
  inventoryController.updateInventory,
);
router.post(
  "/:id/adjust",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(adjustInventorySchema),
  inventoryController.adjustInventory,
);
router.get(
  "/low-stock",
  authenticate,
  authorize([UserRole.Admin]),
  inventoryController.getLowStockInventory,
);
export default router;
