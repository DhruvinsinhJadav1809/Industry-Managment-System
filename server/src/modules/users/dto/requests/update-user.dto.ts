export interface UpdateUserDto {
  fullName: string;
  email: string;
  roleId: number;
  imageUrl?: string;
  isActive: boolean;
}
