import { Router } from "express";
import {
  getFinancialSummary,
  getProductProfitability,
} from "../controllers/dashboard.controller";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorization.middleware";
import { UserRole } from "../../../shared/enums/user-role.enum";

const router = Router();

router.get("/financial-summary", getFinancialSummary);
router.get(
  "/product-profitability",
  authenticate,
  authorize([UserRole.Admin]),
  getProductProfitability,
);
export default router;
