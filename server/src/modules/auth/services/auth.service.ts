import bcrypt from "bcrypt";
import { UnauthorizedError } from "../../../shared/errors/unauthorized.error";
import { LoginRequestDto } from "../dto/request/login-request.dto";
import { LoginResponseDto } from "../dto/response/login-response.dto";
import UserModel from "../../users/schemas/user.schema";
import { toUserResponseDto } from "../../../shared/mappers/user.mapper";
import { generateToken } from "../../../shared/helpers/jwt.helper";
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
): Promise<LoginResponseDto> => {
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
  const accessToken = generateToken(user._id.toString());
  return {
    user: toUserResponseDto(user),
    accessToken: accessToken,
  };
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

  await user.save();
};
