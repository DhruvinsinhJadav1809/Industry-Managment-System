export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  roleId?: number;
  imageUrl?: string;
}
