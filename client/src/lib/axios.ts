import axios, { AxiosError } from "axios";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "../constants/storageKeys";

export { TOKEN_STORAGE_KEY };

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

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
  errors: BackendErrorEnvelope["errors"]
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

// If a request comes back 401 while we believe there's an active session,
// the token is expired/invalid — clear it and bounce to Login. This does
// NOT fire for a failed login attempt itself, since there's no stored
// token yet in that case; that 401 just flows through as a normal error
// for the Login page to show inline.
function handleSessionExpired() {
  const hadToken = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
  if (!hadToken) return;

  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);

  if (window.location.pathname !== "/login") {
    window.location.href = "/login?sessionExpired=1";
  }
}

// Normalize backend error responses into one predictable shape.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<BackendErrorEnvelope>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      handleSessionExpired();
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
  }
);
