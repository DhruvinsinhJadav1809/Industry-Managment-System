export interface UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  roleId: number;
  monthlySalary: number;
  imageUrl?: string;
  isActive: boolean;
}
