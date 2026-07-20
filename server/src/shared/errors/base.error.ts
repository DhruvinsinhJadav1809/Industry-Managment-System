import { ApiError } from "./error-detail.interface";

export class BaseError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly errors: ApiError[] | null = null,
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
