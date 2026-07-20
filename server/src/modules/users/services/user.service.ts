import { UserRole } from "../../../shared/enums/user-role.enum";
import { ConflictError } from "../../../shared/errors/conflict.error";
import { toUserResponseDto } from "../../../shared/mappers/user.mapper";
import { BCRYPT_SALT_ROUNDS } from "../constants/user.constants";
import { CreateUserDto } from "../dto/requests/create-user.dto";
import { GetUsersQueryDto } from "../dto/requests/get-users-query.dto";
import UserModel from "../schemas/user.schema";
import bcrypt from "bcrypt";
import { IUserDocument } from "../types/user.types";
import { QueryFilter, SortOrder, Types } from "mongoose";
import { PaginatedResponseDto } from "../../../shared/types/paginated-response.dto";
import { UserResponseDto } from "../dto/responses/user-response.dto";
import { UpdateUserDto } from "../dto/requests/update-user.dto";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { ForbiddenError } from "../../../shared/errors/forbidden.error";

export const createUser = async (data: CreateUserDto) => {
  const existingUser = await UserModel.findOne({
    email: data.email.trim().toLowerCase(),
  });

  if (existingUser) {
    if (existingUser.isDeleted) {
      throw new ForbiddenError(
        "This account has been deactivated. Please contact your administrator.",
      );
    }

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

export const updateUser = async (
  userId: string,
  data: UpdateUserDto,
  currentUserId: string,
): Promise<UserResponseDto> => {
  // 1. Check if user exists
  const existingUser = await UserModel.findOne({
    _id: userId,
    isDeleted: false,
  });

  if (!existingUser) {
    throw new NotFoundError("User not found.");
  }
  const normalizedEmail = data.email.trim().toLowerCase();

  if (existingUser.email !== normalizedEmail) {
    const duplicateUser = await UserModel.findOne({
      email: normalizedEmail,
      // $ne means find the field but ignore current user means find the mail exist except current user mail.
      _id: { $ne: userId },
      isDeleted: false,
    });

    if (duplicateUser) {
      throw new ConflictError("Email already exists.");
    }
  }

  // 3. Update user
  existingUser.fullName = data.fullName;
  existingUser.email = data.email.trim().toLowerCase();
  existingUser.roleId = data.roleId;
  existingUser.imageUrl = data.imageUrl;
  existingUser.isActive = data.isActive;
  existingUser.updatedBy = new Types.ObjectId(currentUserId);
  await existingUser.save();

  // 4. Return response
  return toUserResponseDto(existingUser);
};

export const deleteUser = async (
  userId: string,
  currentUserId: string,
): Promise<void> => {
  if (userId === currentUserId) {
    throw new BadRequestError("You cannot delete your own account.");
  }
  const user = await UserModel.findOne({
    _id: userId,
    isDeleted: false,
  });

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.deletedBy = new Types.ObjectId(currentUserId);
  user.isActive = false;

  await user.save();
};

export const getUserById = async (userId: string): Promise<UserResponseDto> => {
  const user = await UserModel.findOne({
    _id: userId,
    isDeleted: false,
  });

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  return toUserResponseDto(user);
};
