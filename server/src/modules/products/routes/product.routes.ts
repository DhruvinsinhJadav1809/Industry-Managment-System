import { Router } from "express";

import * as productController from "../controller/product.controller";

import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { validateRequest } from "../../../middleware/validate-request";
import { createProductSchema } from "../validations/create-product.schema";
import { getProductsQuerySchema } from "../validations/get-products-validation.schema";
import { userIdParamsSchema } from "../../users/validations/user-id-params.validation.ts";
import { updateProductSchema } from "../validations/update-product.schema";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(createProductSchema),
  productController.createProduct,
);

router.get(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(getProductsQuerySchema, "query"),
  productController.getProducts,
);

router.get(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(userIdParamsSchema, "params"),
  productController.getProductById,
);

router.delete(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(userIdParamsSchema, "params"),
  productController.deleteProduct,
);

router.put(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(userIdParamsSchema, "params"),
  validateRequest(updateProductSchema),
  productController.updateProduct,
);
export default router;
