import bcrypt from "bcrypt";
import { UnauthorizedError } from "../../../shared/errors/unauthorized.error";
import { LoginRequestDto } from "../dto/request/login-request.dto";
import { LoginResponseDto } from "../dto/response/login-response.dto";
import UserModel from "../../users/schemas/user.schema";
import { toUserResponseDto } from "../../../shared/mappers/user.mapper";
import {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
  verifyRefreshToken,
} from "../../../shared/helpers/jwt.helper";
import { ForgotPasswordDto } from "../types/forgot-password.dto";
import {
  generateSecureToken,
  hashToken,
} from "../../../shared/helpers/token.helper";
import { buildResetPasswordTemplate } from "../../../shared/email/templates/reset-password.template";
import { mailService } from "../../../shared/email/mail.service";
import { ResetPasswordDto } from "../types/reset-password.dto";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { BCRYPT_SALT_ROUNDS } from "../../users/constants/user.constants";

export const login = async (
  data: LoginRequestDto,
): Promise<
  LoginResponseDto & { refreshToken: string; refreshTokenMaxAge: number }
> => {
  const user = await UserModel.findOne({
    email: data.email.toLowerCase(),
    isDeleted: false,
  }).select("+password");
  if (!user) {
    throw new UnauthorizedError("Invalid email or password.");
  }
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password.");
  }
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  return {
    user: toUserResponseDto(user),
    accessToken,
    refreshToken,
    refreshTokenMaxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  };
};

export const refresh = async (
  token: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  refreshTokenMaxAge: number;
}> => {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token.");
  }

  const user = await UserModel.findOne({
    _id: payload.userId,
    isDeleted: false,
  }).select("+refreshTokenHash");

  if (!user || user.refreshTokenHash !== hashToken(token)) {
    throw new UnauthorizedError("Invalid or expired refresh token.");
  }

  const refreshTokenMaxAge = Math.max(0, payload.exp! * 1000 - Date.now());
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString(), payload.exp);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return { accessToken, refreshToken, refreshTokenMaxAge };
};

export const logout = async (token?: string): Promise<void> => {
  if (!token) {
    return;
  }

  try {
    const payload = verifyRefreshToken(token);
    await UserModel.updateOne(
      { _id: payload.userId, refreshTokenHash: hashToken(token) },
      { $set: { refreshTokenHash: null } },
    );
  } catch {
    // Invalid or expired cookies are still cleared by the controller.
  }
};

export const forgotPassword = async (
  data: ForgotPasswordDto,
): Promise<void> => {
  const user = await UserModel.findOne({
    email: data.email,
    isDeleted: false,
  });

  // Don't reveal whether the email exists
  if (!user) {
    return;
  }

  const token = generateSecureToken();
  const hashedToken = hashToken(token);

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const html = buildResetPasswordTemplate({
    userName: user.fullName,
    resetLink,
  });

  await mailService.send({
    to: user.email,
    subject: "Reset your password",
    html,
  });
};

export const resetPassword = async (data: ResetPasswordDto): Promise<void> => {
  const hashedToken = hashToken(data.token);

  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: {
      $gt: new Date(),
    },
    isDeleted: false,
  });

  if (!user) {
    throw new BadRequestError("Invalid or expired reset password link.");
  }

  user.password = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;
  user.refreshTokenHash = null;

  await user.save();
};
