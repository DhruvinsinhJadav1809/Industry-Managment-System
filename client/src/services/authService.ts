import { apiClient } from "../lib/axios";
import type {
  ApiResponse,
  LoginPayload,
  LoginResult,
  RegisterPayload,
  RegisteredUser,
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
};
