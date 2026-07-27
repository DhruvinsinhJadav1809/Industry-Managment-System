export interface DepartmentResponseDto {
  id: string;
  name: string;
  code: string;
  description?: string;

  managerId?: string;

  isActive: boolean;
}
