import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  LEGACY_REFRESH_TOKEN_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "../constants/storageKeys";

export { TOKEN_STORAGE_KEY };

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: true,
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  data: {
    accessToken: string;
  };
}

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true,
});

let refreshRequest: Promise<string> | null = null;

// Attach auth token to every request, if present.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Shape every consumer of the API can rely on, regardless of what the
 * backend actually sent back.
 */
export interface ApiErrorShape {
  message: string;
  status?: number;
  fieldErrors?: Record<string, string>;
}

interface FieldErrorEntry {
  field: string;
  message: string;
}

interface BackendErrorEnvelope {
  success?: boolean;
  message?: string;
  errors?: Record<string, string> | string[] | FieldErrorEntry[] | null;
}

// The API's `errors` field has shown up as an object ({ field: message }),
// an array of strings, and an array of { field, message } — flatten any of
// them into { field: message } for forms to key off of.
function normalizeFieldErrors(
  errors: BackendErrorEnvelope["errors"],
): Record<string, string> | undefined {
  if (!errors) return undefined;

  if (Array.isArray(errors)) {
    return errors.reduce<Record<string, string>>((acc, entry, i) => {
      if (typeof entry === "string") {
        acc[`error_${i}`] = entry;
      } else if (entry && typeof entry === "object" && "field" in entry) {
        acc[entry.field] = entry.message;
      }
      return acc;
    }, {});
  }

  return errors;
}

// Clear an active session after refresh fails or a retried request is
// rejected. Anonymous 401s still flow through as normal API errors.
function handleSessionExpired() {
  const hadSession = Boolean(
    localStorage.getItem(TOKEN_STORAGE_KEY) ||
    localStorage.getItem(USER_STORAGE_KEY),
  );
  if (!hadSession) return;

  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);

  if (window.location.pathname !== "/login") {
    window.location.href = "/login?sessionExpired=1";
  }
}

function refreshAccessToken(): Promise<string> {
  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post<RefreshResponse>("/auth/refresh", undefined, {
        withCredentials: true,
      })
      .then(({ data }) => {
        const { accessToken } = data.data;
        if (!accessToken)
          throw new Error("Refresh response has no access token");
        localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
        return accessToken;
      })
      .catch((refreshError: unknown) => {
        handleSessionExpired();
        throw refreshError;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

// Normalize backend error responses into one predictable shape.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<BackendErrorEnvelope>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      const request = error.config as RetryableRequestConfig | undefined;
      const requestUrl = request?.url ?? "";
      const isAuthRequest = /\/auth\/(login|refresh|logout)(?:\?|$)/.test(
        requestUrl,
      );

      if (request && !request._retry && !isAuthRequest) {
        request._retry = true;
        try {
          const accessToken = await refreshAccessToken();
          request.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(request);
        } catch {
          // Refresh failure clears the session and redirects to Login.
        }
      } else if (request?._retry && !isAuthRequest) {
        handleSessionExpired();
      }
    }

    const normalized: ApiErrorShape = {
      message:
        data?.message ||
        (status === 0 || !status
          ? "Can't reach the server. Check your connection and try again."
          : "Something went wrong. Please try again."),
      status,
      fieldErrors: normalizeFieldErrors(data?.errors),
    };

    return Promise.reject(normalized);
  },
);
