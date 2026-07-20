import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { ValidationError } from "../shared/errors/validation.error";

type ValidationSource = "body" | "query" | "params";

export const validateRequest =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req[source]);

      if (source === "body") {
        req.body = validated;
      } else {
        res.locals.validated = validated;
      }

      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return next(new ValidationError("Validation failed.", errors));
      }

      next(error);
    }
  };
