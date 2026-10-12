import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/helpers/async-handler";
import * as authService from "../services/auth.service";
import { successResponse } from "../../../shared/response/response.helper";
import { UnauthorizedError } from "../../../shared/errors/unauthorized.error";
import { REFRESH_TOKEN_COOKIE_MAX_AGE } from "../../../shared/helpers/jwt.helper";

const REFRESH_TOKEN_COOKIE = "refreshToken";

const refreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/api/auth",
  };
};

const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
  maxAge = REFRESH_TOKEN_COOKIE_MAX_AGE,
): void => {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...refreshTokenCookieOptions(),
    maxAge,
  });
};

const getRefreshTokenCookie = (req: Request): string | undefined => {
  const cookiePrefix = `${REFRESH_TOKEN_COOKIE}=`;
  const refreshCookie = req.headers.cookie
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(cookiePrefix));

  return refreshCookie?.slice(cookiePrefix.length);
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const response = await authService.login(req.body);
  const { refreshToken, refreshTokenMaxAge, ...loginResponse } = response;
  setRefreshTokenCookie(res, refreshToken, refreshTokenMaxAge);

  return res
    .status(200)
    .json(successResponse(loginResponse, "Login successful."));
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenCookie(req);
  if (!refreshToken) {
    throw new UnauthorizedError("Refresh token is missing.");
  }

  const response = await authService.refresh(refreshToken);
  setRefreshTokenCookie(
    res,
    response.refreshToken,
    response.refreshTokenMaxAge,
  );

  return res
    .status(200)
    .json(
      successResponse(
        { accessToken: response.accessToken },
        "Token refreshed successfully.",
      ),
    );
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(getRefreshTokenCookie(req));
  res.clearCookie(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions());

  return res.status(200).json(successResponse(null, "Logout successful."));
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
