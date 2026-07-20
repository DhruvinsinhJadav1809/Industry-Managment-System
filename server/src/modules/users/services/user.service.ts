import { UserRole } from "../../../shared/enums/user-role.enum";
import { ConflictError } from "../../../shared/errors/conflict.error";
import { toUserResponseDto } from "../../../shared/mappers/user.mapper";
import { BCRYPT_SALT_ROUNDS } from "../constants/user.constants";
import { CreateUserDto } from "../dto/requests/create-user.dto";
import { GetUsersQueryDto } from "../dto/requests/get-users-query.dto";
import UserModel from "../schemas/user.schema";
import bcrypt from "bcrypt";
import { IUserDocument } from "../types/user.types";
import { QueryFilter, SortOrder } from "mongoose";
import { PaginatedResponseDto } from "../../../shared/types/paginated-response.dto";
import { UserResponseDto } from "../dto/responses/user-response.dto";
export const createUser = async (data: CreateUserDto) => {
  const existingUser = await UserModel.findOne({
    email: data.email.trim().toLowerCase(),
    isDeleted: false,
  });

  if (existingUser) {
    throw new ConflictError("Email already exists.");
  }
  const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
  const user = await UserModel.create({
    ...data,
    password: hashedPassword,
    roleId: data.roleId ?? UserRole.Customer,
  });
  return toUserResponseDto(user);
};

export const getUsers = async (
  query: GetUsersQueryDto,
): Promise<PaginatedResponseDto<UserResponseDto>> => {
  const {
    page,
    pageSize,
    search,
    roleId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter: QueryFilter<IUserDocument> = {
    isDeleted: false,
  };

  if (search) {
    filter.$or = [
      {
        fullName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (roleId) {
    filter.roleId = roleId;
  }

  const skip = (page - 1) * pageSize;

  const sort: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? "asc" : "desc",
  };

  const [users, totalRecords] = await Promise.all([
    UserModel.find(filter).sort(sort).skip(skip).limit(pageSize),

    UserModel.countDocuments(filter),
  ]);

  return {
    items: users.map(toUserResponseDto),
    page,
    pageSize,
    totalRecords,
    totalPages: Math.ceil(totalRecords / pageSize),
  };
};
