import { BaseError } from "./base.error";

export class BadRequestError extends BaseError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}
