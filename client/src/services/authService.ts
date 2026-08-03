import { apiClient } from "../lib/axios";
import type {
  ApiResponse,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResult,
  RegisterPayload,
  RegisteredUser,
  ResetPasswordPayload,
} from "../types/auth";

export const authService = {
  /**
   * POST /users — creates a new account. Returns the created user;
   * no token is issued here, so the flow lands the person on Login next.
   */
  register: async (payload: RegisterPayload) => {
    const { data } = await apiClient.post<ApiResponse<RegisteredUser>>(
      "/users",
      payload
    );
    return data;
  },

  /**
   * POST /auth/login — to be confirmed once the login endpoint is provided.
   */
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<ApiResponse<LoginResult>>(
      "/auth/login",
      payload
    );
    return data;
  },

  /** POST /auth/forgot-password — sends a reset link to the given email. */
  forgotPassword: async (payload: ForgotPasswordPayload) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      "/auth/forgot-password",
      payload
    );
    return data;
  },

  /** POST /auth/reset-password — token from the emailed reset link. */
  resetPassword: async (payload: ResetPasswordPayload) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      "/auth/reset-password",
      payload
    );
    return data;
  },
};
