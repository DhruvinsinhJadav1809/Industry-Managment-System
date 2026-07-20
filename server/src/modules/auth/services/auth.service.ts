import bcrypt from "bcrypt";
import { UnauthorizedError } from "../../../shared/errors/unauthorized.error";
import { LoginRequestDto } from "../dto/request/login-request.dto";
import { LoginResponseDto } from "../dto/response/login-response.dto";
import UserModel from "../../users/schemas/user.schema";
import { toUserResponseDto } from "../../../shared/mappers/user.mapper";
import { generateToken } from "../../../shared/helpers/jwt.helper";

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
