import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { loginValidation } from "../validations/login.validation";
import { validateRequest } from "../../../middleware/validate-request";

const router = Router();

router.post("/login", validateRequest(loginValidation), authController.login);

export default router;
