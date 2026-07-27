import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import { GetDepartmentsQueryDto } from "../dto/requests/get-department.dto";
import { UpdateDepartmentDto } from "../dto/requests/update-department.dto";
import * as departmentService from "../services/department.service";

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(
    req.body,
    req.user.id,
  );

  return res
    .status(201)
    .json(successResponse(department, "Department created successfully."));
});

export const assignManager = asyncHandler(async (req, res) => {
  const userId = String(req.params.id);
  const department = await departmentService.assignManager(
    userId,
    req.body,
    req.user.id,
  );

  return res.json(
    successResponse(department, "Manager assigned successfully."),
  );
});

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.getDepartments(
    req.query as unknown as GetDepartmentsQueryDto,
  );

  return res.json(
    successResponse(departments, "Departments retrieved successfully."),
  );
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(
    String(req.params.id),
  );

  return res.json(
    successResponse(department, "Department retrieved successfully."),
  );
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(
    String(req.params.id),
    req.body as UpdateDepartmentDto,
    req.user.id,
  );

  return res.json(
    successResponse(department, "Department updated successfully."),
  );
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(String(req.params.id), req.user.id);

  return res.json(successResponse(null, "Department deleted successfully."));
});
