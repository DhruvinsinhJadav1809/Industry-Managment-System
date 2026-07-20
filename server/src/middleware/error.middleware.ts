import { NextFunction, Request, Response } from "express";
import { BaseError } from "../shared/errors/base.error";
import { logger } from "../shared/helpers/logger";
import { errorResponse } from "../shared/response/response.helper";
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(error.message);
  if (error instanceof BaseError) {
    return res
      .status(error.statusCode)
      .json(errorResponse(error.message, error.errors));
  }

  return res.status(500).json(errorResponse("Internal Server Error"));
};
