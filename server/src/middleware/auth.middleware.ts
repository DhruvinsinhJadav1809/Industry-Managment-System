import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../shared/errors/unauthorized.error";
import { verifyToken } from "../shared/helpers/jwt.helper";
import UserModel from "../modules/users/schemas/user.schema";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError("Authentication token is missing.");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Invalid authentication token.");
  }

  const token = authHeader.split(" ")[1];

  const payload = verifyToken(token);

  const user = await UserModel.findOne({
    _id: payload.userId,
    isDeleted: false,
  });

  if (!user) {
    throw new UnauthorizedError("User not found.");
  }

  req.user = {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    roleId: user.roleId,
  };

  next();
};
