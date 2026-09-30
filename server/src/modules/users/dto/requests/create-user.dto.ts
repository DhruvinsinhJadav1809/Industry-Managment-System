export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  roleId?: number;
  monthlySalary?: number;
  imageUrl?: string;
}
