/**
 * Every response from the API is wrapped in this envelope.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string> | string[] | null;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * `data` shape returned by POST /users.
 */
export interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  roleId: number;
  isActive: boolean;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  roleId?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

/**
 * `data` shape returned by POST /auth/login.
 */
export interface LoginResult {
  user: AuthUser;
  accessToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}
