export interface UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  roleId: number;
  imageUrl?: string;
  isActive: boolean;
}
