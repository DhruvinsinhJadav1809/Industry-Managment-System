import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/helpers/async-handler";
import * as authService from "../services/auth.service";
import { successResponse } from "../../../shared/response/response.helper";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const response = await authService.login(req.body);

  return res.status(200).json(successResponse(response, "Login successful."));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);

  return res
    .status(200)
    .json(
      successResponse(
        null,
        "If an account exists, a password reset link has been sent.",
      ),
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);

  return res
    .status(200)
    .json(successResponse(null, "Password reset successfully."));
});
