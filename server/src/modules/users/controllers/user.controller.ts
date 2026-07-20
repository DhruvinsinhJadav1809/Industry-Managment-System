import * as userService from "../services/user.service";
import { successResponse } from "../../../shared/response/response.helper";
import { asyncHandler } from "../../../shared/helpers/async-handler";
import { GetUsersQueryDto } from "../dto/requests/get-users-query.dto";

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
