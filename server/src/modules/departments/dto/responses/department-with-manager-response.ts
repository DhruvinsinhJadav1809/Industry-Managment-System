import { DepartmentManagerDto } from "./department-manager-response.dto";

export interface DepartmentWithManagerResponse {
  id: string;
  name: string;
  code: string;
  description?: string;

  manager?: DepartmentManagerDto | undefined;

  isActive: boolean;
}
