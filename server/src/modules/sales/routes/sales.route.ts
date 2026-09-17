import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { validateRequest } from "../../../middleware/validate-request";
import {
  createSaleSchema,
  getSalesQuerySchema,
  updateSalePaymentSchema,
} from "../validation/sale.validation";
import * as saleController from "../controller/sales.controller";
import { userIdParamsSchema } from "../../users/validations/user-id-params.validation.ts";

const router = Router();
router.get(
  "/export",
  authenticate,
  authorize([UserRole.Admin, UserRole.Employee]),
  saleController.exportSales,
);

router.get(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(getSalesQuerySchema, "query"),
  saleController.getSales,
);
router.post(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(createSaleSchema),
  saleController.createSale,
);
router.patch(
  "/:id/payment",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(updateSalePaymentSchema),
  saleController.updateSalePayment,
);
router.get(
  "/:id",
  authenticate,
  authorize([UserRole.Admin, UserRole.Employee]),
  validateRequest(userIdParamsSchema, "params"),
  saleController.getSalesById,
);
router.get("/:id/pdf", authenticate, saleController.downloadSalePdf);
export default router;
