import { UserResponseDto } from "../../../users/dto/responses/user-response.dto";

export interface LoginResponseDto {
  user: UserResponseDto;
  accessToken: string;
}
