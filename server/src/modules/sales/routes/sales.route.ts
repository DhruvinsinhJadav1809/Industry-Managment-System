import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { validateRequest } from "../../../middleware/validate-request";
import {
  createSaleSchema,
  getSalesQuerySchema,
} from "../validation/sale.validation";
import * as saleController from "../controller/sales.controller";

const router = Router();
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

export default router;
