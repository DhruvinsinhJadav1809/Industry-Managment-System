import { Router } from "express";
import { authorize } from "../../../middleware/authorization.middleware";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { authenticate } from "../../../middleware/auth.middleware";
import { validateRequest } from "../../../middleware/validate-request";
import { updateSupplierSchema } from "../validations/update-supplier-validation";
import { getSuppliersQuerySchema } from "../validations/get-supplier-validation";
import { createSupplierSchema } from "../validations/create-supplier-validation";
import * as supplierController from "../controller/supplier-controller";
const router = Router();

router.post(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(createSupplierSchema),
  supplierController.createSupplier,
);

router.get(
  "/",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(getSuppliersQuerySchema, "query"),
  supplierController.getSuppliers,
);
router.get(
  "/export",
  authenticate,
  authorize([UserRole.Admin]),
  supplierController.exportSuppliers,
);

router.get(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  supplierController.getSupplierById,
);

router.put(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  validateRequest(updateSupplierSchema, "params"),
  supplierController.updateSupplier,
);

router.delete(
  "/:id",
  authenticate,
  authorize([UserRole.Admin]),
  supplierController.deleteSupplier,
);

export default router;
