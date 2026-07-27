import { DepartmentWithManagerResponse } from "../../modules/departments/dto/responses/department-with-manager-response";
import { IDepartmentPopulatedDocument } from "../../modules/departments/types/department.types";

export const toDepartmentWithManagerResponseDto = (
  department: IDepartmentPopulatedDocument,
): DepartmentWithManagerResponse => ({
  id: department._id.toString(),
  name: department.name,
  code: department.code,
  description: department.description,

  manager: department.managerId
    ? {
        id: department.managerId._id.toString(),
        fullName: department.managerId.fullName,
        email: department.managerId.email,
        roleId: department.managerId.roleId,
      }
    : undefined,

  isActive: department.isActive,
});
