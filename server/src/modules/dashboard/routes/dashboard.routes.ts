import { Router } from "express";
import { getFinancialSummary } from "../controllers/dashboard.controller";

const router = Router();

router.get("/financial-summary", getFinancialSummary);

export default router;
