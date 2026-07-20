import axios, { AxiosError } from "axios";

export const TOKEN_STORAGE_KEY = "ims-token";

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

interface BackendErrorEnvelope {
  success?: boolean;
  message?: string;
  errors?: Record<string, string> | string[] | null;
}

// The API's `errors` field can arrive as an object ({ field: message }) or
// an array of strings — flatten either into { field: message } for forms.
function normalizeFieldErrors(
  errors: BackendErrorEnvelope["errors"]
): Record<string, string> | undefined {
  if (!errors) return undefined;
  if (Array.isArray(errors)) {
    return errors.reduce<Record<string, string>>((acc, msg, i) => {
      acc[`error_${i}`] = msg;
      return acc;
    }, {});
  }
  return errors;
}

// Normalize backend error responses into one predictable shape.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<BackendErrorEnvelope>) => {
    const status = error.response?.status;
    const data = error.response?.data;

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
