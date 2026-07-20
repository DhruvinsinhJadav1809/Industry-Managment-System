import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../shared/errors/forbidden.error";
import { UserRole } from "../shared/enums/user-role.enum";

export const authorize =
  (roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ForbiddenError();
    }
    if (!roles.includes(req.user.roleId)) {
      throw new ForbiddenError();
    }
    next();
  };
