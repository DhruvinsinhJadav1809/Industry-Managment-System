import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { validateRequest } from "../../../middleware/validate-request";

import { UserRole } from "../../../shared/enums/user-role.enum";

import * as purchaseController from "../controller/purchase.controller";

import { createPurchaseSchema } from "../validations/create-purchase.validation";
import { updatePurchaseSchema } from "../validations/update-purchase.validation";
import { getPurchasesSchema } from "../validations/get-purchase.validation";

import { userIdParamsSchema } from "../../users/validations/user-id-params.validation.ts";

const router = Router();

router.get(
  "/export",
  authenticate,
  authorize([UserRole.Admin, UserRole.Employee]),
  purchaseController.exportPurchases,
);

router.post(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(createPurchaseSchema),
  purchaseController.createPurchase,
);

router.get(
  "/",
  authenticate,
  authorize([UserRole.Admin, UserRole.Employee]),
  validateRequest(getPurchasesSchema, "query"),
  purchaseController.getPurchases,
);

router.get(
  "/:id",
  authenticate,
  authorize([UserRole.Admin, UserRole.Employee]),
  validateRequest(userIdParamsSchema, "params"),
  purchaseController.getPurchaseById,
);
router.get("/:id/pdf", authenticate, purchaseController.downloadPurchasePdf);
// router.put(
//   "/:id",
//   authenticate,
//   authorize([UserRole.Admin]),
//   validateRequest(objectIdSchema, "params"),
//   validateRequest(updatePurchaseSchema),
//   purchaseController.updatePurchase,
// );

// router.delete(
//   "/:id",
//   authenticate,
//   authorize([UserRole.Admin]),
//   validateRequest(objectIdSchema, "params"),
//   purchaseController.deletePurchase,
// );

export default router;
