import { BaseError } from "./base.error";
import { ApiError } from "./error-detail.interface";

export class ValidationError extends BaseError {
  constructor(
    message: string = "Validation failed.",
    errors: ApiError[] | null = null,
  ) {
    super(message, 400, errors);
  }
}
