import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { validateRequest } from "../../../middleware/validate-request";
import { UserRole } from "../../../shared/enums/user-role.enum";
import * as orderController from "../controllers/order.controller";
import {
  acceptOrderSchema,
  createOrderSchema,
  getOrdersQuerySchema,
  orderIdParamsSchema,
  updateOrderSchema,
} from "../validations/order.validation";

const router = Router();

router.get(
  "/summary",
  authenticate,
  authorize([UserRole.Admin]),
  orderController.getOrderSummary,
);

router.get(
  "/",
  authenticate,
  authorize([UserRole.Customer, UserRole.Admin]),
  validateRequest(getOrdersQuerySchema, "query"),
  orderController.getOrders,
);

router.post(
  "/",
  authenticate,
  authorize([UserRole.Customer]),
  validateRequest(createOrderSchema),
  orderController.createOrder,
);

router.patch(
  "/:id",
  authenticate,
  authorize([UserRole.Customer]),
  validateRequest(orderIdParamsSchema, "params"),
  validateRequest(updateOrderSchema),
  orderController.updateOrder,
);

router.patch(
  "/:id/accept",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(orderIdParamsSchema, "params"),
  validateRequest(acceptOrderSchema),
  orderController.acceptOrder,
);

export default router;
