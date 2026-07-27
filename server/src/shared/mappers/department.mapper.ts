import { DepartmentResponseDto } from "../../modules/departments/dto/responses/department-response.dto";
import { IDepartmentDocument } from "../../modules/departments/types/department.types";

export const toDepartmentResponseDto = (
  department: IDepartmentDocument,
): DepartmentResponseDto => ({
  id: department._id.toString(),
  name: department.name,
  code: department.code,
  description: department.description,
  managerId: department.managerId?.toString(),
  isActive: department.isActive,
});
