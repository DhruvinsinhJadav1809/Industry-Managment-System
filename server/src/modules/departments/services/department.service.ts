import DepartmentModel from "../schemas/department.schema";
import UserModel from "../../users/schemas/user.schema";
import { CreateDepartmentDto } from "../dto/requests/create-department.dto";
import { DepartmentResponseDto } from "../dto/responses/department-response.dto";
import { ConflictError } from "../../../shared/errors/conflict.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { toDepartmentResponseDto } from "../../../shared/mappers/department.mapper";
import { AssignManagerDto } from "../dto/requests/assign-manager.dto";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { IUserDocument } from "../../users/types/user.types";
import { toDepartmentWithManagerResponseDto } from "../../../shared/mappers/department-with-manager.mapper";
import { GetDepartmentsQueryDto } from "../dto/requests/get-department.dto";
import { PaginatedResponseDto } from "../../../shared/types/paginated-response.dto";
import {
  IDepartmentDocument,
  IDepartmentPopulatedDocument,
} from "../types/department.types";
import { QueryFilter, SortOrder, Types } from "mongoose";
import { DepartmentWithManagerResponse } from "../dto/responses/department-with-manager-response";
import { DEPARTMENT_MANAGER_POPULATE } from "../constants/department-constants";
import { UpdateDepartmentDto } from "../dto/requests/update-department.dto";
import { ProductModel } from "../../products/schemas/product.model";

export const createDepartment = async (
  data: CreateDepartmentDto,
  currentUserId: string,
): Promise<DepartmentResponseDto> => {
  const existingDepartment = await DepartmentModel.findOne({
    isDeleted: false,
    $or: [
      {
        name: data.name.trim(),
      },
      {
        code: data.code.trim().toUpperCase(),
      },
    ],
  });

  if (existingDepartment?.name === data.name.trim()) {
    throw new ConflictError("Department name already exists.");
  }

  if (existingDepartment?.code === data.code.trim().toUpperCase()) {
    throw new ConflictError("Department code already exists.");
  }
  if (data.managerId) {
    const manager = await UserModel.findOne({
      _id: data.managerId,
      isDeleted: false,
    });
    if (!manager) {
      throw new NotFoundError("Manager not found.");
    }
    if (!manager.isActive) {
      throw new BadRequestError("Selected manager is inactive.");
    }
  }
  const department = await DepartmentModel.create({
    ...data,
    createdBy: currentUserId,
  });
  return toDepartmentResponseDto(department);
};

export const assignManager = async (
  departmentId: string,
  data: AssignManagerDto,
  currentUserId: string,
): Promise<DepartmentResponseDto> => {
  const department = await DepartmentModel.findOne({
    _id: departmentId,
    isDeleted: false,
  });

  if (!department) {
    throw new NotFoundError("Department not found.");
  }
  if (department.managerId?.toString() === data.managerId) {
    throw new BadRequestError(
      "Selected user is already assigned as department manager.",
    );
  }
  const manager = await UserModel.findOne({
    _id: data.managerId,
    isDeleted: false,
  });

  if (!manager) {
    throw new NotFoundError("Manager not found.");
  }
  if (!manager.isActive) {
    throw new BadRequestError("Selected manager is inactive.");
  }
  if (manager.roleId !== UserRole.Employee) {
    throw new BadRequestError(
      "Selected user cannot be assigned as a department manager.",
    );
  }
  const updatedDepartment = await DepartmentModel.findByIdAndUpdate(
    departmentId,
    {
      managerId: data.managerId,
      updatedBy: currentUserId,
    },
    { returnDocument: "after" },
  ).populate<{
    managerId: IUserDocument;
  }>(DEPARTMENT_MANAGER_POPULATE);
  return toDepartmentWithManagerResponseDto(updatedDepartment!);
};

export const getDepartments = async (
  query: GetDepartmentsQueryDto,
): Promise<PaginatedResponseDto<DepartmentWithManagerResponse>> => {
  const {
    page,
    pageSize,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter: QueryFilter<IDepartmentDocument> = {
    isDeleted: false,
  };

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        code: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const skip = (page - 1) * pageSize;

  const sort: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? "asc" : "desc",
  };

  const [departments, totalRecords] = await Promise.all([
    DepartmentModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .populate(DEPARTMENT_MANAGER_POPULATE)
      .lean<IDepartmentPopulatedDocument[]>(),

    DepartmentModel.countDocuments(filter),
  ]);

  return {
    items: departments.map(toDepartmentWithManagerResponseDto),
    page,
    pageSize,
    totalRecords,
    totalPages: Math.ceil(totalRecords / pageSize),
  };
};

export const getDepartmentById = async (
  departmentId: string,
): Promise<DepartmentWithManagerResponse> => {
  const department = await DepartmentModel.findOne({
    _id: departmentId,
    isDeleted: false,
  })
    .populate(DEPARTMENT_MANAGER_POPULATE)
    .lean<IDepartmentPopulatedDocument>();

  if (!department) {
    throw new NotFoundError("Department not found.");
  }
  return toDepartmentWithManagerResponseDto(department);
};

export const updateDepartment = async (
  departmentId: string,
  data: UpdateDepartmentDto,
  currentUserId: string,
): Promise<DepartmentWithManagerResponse> => {
  const normalizedName = data.name?.trim();
  const normalizedCode = data.code?.trim().toUpperCase();
  const duplicateConditions = [];
  if (normalizedName) duplicateConditions.push({ name: normalizedName });
  if (normalizedCode) duplicateConditions.push({ code: normalizedCode });

  const [department, existingDuplicate] = await Promise.all([
    DepartmentModel.findOne({ _id: departmentId, isDeleted: false }),
    duplicateConditions.length > 0
      ? DepartmentModel.findOne({
          _id: { $ne: departmentId },
          isDeleted: false,
          $or: duplicateConditions,
        })
          .select("name code")
          .lean()
      : null,
  ]);

  if (!department) {
    throw new NotFoundError("Department not found.");
  }

  if (existingDuplicate) {
    if (existingDuplicate.name === normalizedName) {
      throw new ConflictError("Department name already exists.");
    }
    if (existingDuplicate.code === normalizedCode) {
      throw new ConflictError("Department code already exists.");
    }
  }

  if (normalizedName) department.name = normalizedName;
  if (normalizedCode) department.code = normalizedCode;
  if (data.description !== undefined) department.description = data.description;
  if (data.isActive !== undefined) department.isActive = data.isActive;
  department.updatedBy = new Types.ObjectId(currentUserId);

  await department.save();

  await department.populate(DEPARTMENT_MANAGER_POPULATE);

  return toDepartmentWithManagerResponseDto(
    department.toObject() as unknown as IDepartmentPopulatedDocument,
  );
};

export const deleteDepartment = async (
  departmentId: string,
  currentUserId: string,
): Promise<void> => {
  const department = await DepartmentModel.findOne({
    _id: departmentId,
    isDeleted: false,
  });

  if (!department) {
    throw new NotFoundError("Department not found.");
  }

  // Future Business Validation
  // Example:
  const hasProducts = await ProductModel.exists({
    departmentId,
    isDeleted: false,
  });

  if (hasProducts) {
    throw new ConflictError(
      "Department cannot be deleted because it is assigned to products.",
    );
  }

  department.isDeleted = true;
  department.deletedAt = new Date();
  department.deletedBy = new Types.ObjectId(currentUserId);

  await department.save();
};
