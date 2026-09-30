import { UserResponseDto } from "../../modules/users/dto/responses/user-response.dto";
import { IUserDocument } from "../../modules/users/types/user.types";

export const toUserResponseDto = (user: IUserDocument): UserResponseDto => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  roleId: user.roleId,
  monthlySalary: user.monthlySalary ?? 0,
  imageUrl: user.imageUrl,
  isActive: user.isActive,
});
