import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import * as settingsService from "../service/settings-service";
export const createSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.createSettings(req.body, req.user.id);

  return res.json(successResponse(settings, "Settings created successfully."));
});

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings();

  if (!settings) {
    return res.json(successResponse(null));
  }

  const response = {
    ...settings,
    logoUrl: settings.logoUrl
      ? `${req.protocol}://${req.get("host")}${settings.logoUrl}`
      : null,
  };

  return res.json(successResponse(response));
});
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(req.body, req.user.id);

  return res.json(successResponse(settings, "Settings updated successfully."));
});
export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("Logo is required.");
  }

  const settings = await settingsService.uploadLogo(
    req.file.filename,
    req.user.id,
  );
  const response = {
    ...settings,
    logoUrl: settings.logoUrl
      ? `${req.protocol}://${req.get("host")}${settings.logoUrl}`
      : null,
  };
  return res.json(successResponse(response, "Logo uploaded successfully."));
});
