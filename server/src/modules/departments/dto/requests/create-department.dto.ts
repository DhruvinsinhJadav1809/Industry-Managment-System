export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
  managerId?: string;
}
