import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/helpers/async-handler";
import * as authService from "../services/auth.service";
import { successResponse } from "../../../shared/response/response.helper";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const response = await authService.login(req.body);

  return res.status(200).json(successResponse(response, "Login successful."));
});
