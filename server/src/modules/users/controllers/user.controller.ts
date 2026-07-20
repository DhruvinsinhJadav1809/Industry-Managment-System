import * as userService from "../services/user.service";
import { successResponse } from "../../../shared/response/response.helper";
import { asyncHandler } from "../../../shared/helpers/async-handler";
import { GetUsersQueryDto } from "../dto/requests/get-users-query.dto";
import { UpdateUserDto } from "../dto/requests/update-user.dto";

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);

  return res
    .status(201)
    .json(successResponse(user, "User created successfully."));
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers(
    req.query as unknown as GetUsersQueryDto,
  );

  return res.json(successResponse(users, "Users retrieved successfully."));
});

export const updateUser = asyncHandler(async (req, res) => {
  const userId = String(req.params.id);
  const updatedUser = await userService.updateUser(
    userId,
    req.body as UpdateUserDto,
    req.user.id,
  );

  return res.json(successResponse(updatedUser, "User updated successfully."));
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(String(req.params.id), req.user.id);

  return res.json(successResponse(null, "User deleted successfully."));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(String(req.params.id));

  return res.json(successResponse(user, "User retrieved successfully."));
});
