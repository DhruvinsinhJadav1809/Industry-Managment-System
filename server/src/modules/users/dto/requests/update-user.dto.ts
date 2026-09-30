export interface UpdateUserDto {
  fullName: string;
  email: string;
  roleId: number;
  monthlySalary?: number;
  imageUrl?: string;
  isActive: boolean;
}
