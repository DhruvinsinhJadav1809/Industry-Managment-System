import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type {
  CompanySettings,
  CreateSettingsPayload,
  UpdateSettingsPayload,
  UploadLogoResponseData,
} from "../types/settings";

export const settingsService = {
  /** GET /settings */
  get: async () => {
    const { data } =
      await apiClient.get<ApiResponse<CompanySettings>>("/settings");
    return data;
  },

  /** POST /settings — only succeeds once; use update() after that. */
  create: async (payload: CreateSettingsPayload) => {
    const { data } = await apiClient.post<ApiResponse<CompanySettings>>(
      "/settings",
      payload,
    );
    return data;
  },

  /** PUT /settings — partial update, send only changed fields. */
  update: async (payload: UpdateSettingsPayload) => {
    const { data } = await apiClient.put<ApiResponse<CompanySettings>>(
      "/settings",
      payload,
    );
    return data;
  },

  /**
   * POST /settings/logo — multipart/form-data upload.
   * Content-Type is intentionally left unset: axios/the browser needs to
   * generate the multipart boundary itself from the FormData object, so
   * forcing a Content-Type header here would break the upload.
   */
  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    const { data } = await apiClient.post<ApiResponse<UploadLogoResponseData>>(
      "/settings/logo",
      formData,
      { headers: { "Content-Type": undefined } },
    );
    return data;
  },
};
