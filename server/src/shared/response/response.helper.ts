import { ApiError } from "../errors/error-detail.interface";
import { ApiResponse } from "./api-response";

export const successResponse = <T>(
  data: T,
  message = "Request completed successfully.",
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    errors: null,
  };
};

export const errorResponse = (
  message: string,
  errors: ApiError[] | null = null,
) => ({
  success: false,
  message,
  data: null,
  errors,
});
