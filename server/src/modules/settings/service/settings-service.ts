import { Types } from "mongoose";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { CreateSettingsDto } from "../dto/requests/create-settings.dto";
import { UpdateSettingsDto } from "../dto/requests/update-settings.dto";
import { SettingsModel } from "../schema/settings.schema";

export const createSettings = async (
  data: CreateSettingsDto,
  currentUserId: string,
) => {
  const existing = await SettingsModel.findOne();

  if (existing) {
    throw new BadRequestError("Settings already exist.");
  }

  const settings = await SettingsModel.create({
    ...data,
    createdBy: currentUserId,
  });

  return settings;
};
export const getSettings = async () => {
  return await SettingsModel.findOne().lean();
};
export const updateSettings = async (
  data: UpdateSettingsDto,
  currentUserId: string,
) => {
  const settings = await SettingsModel.findOne();

  if (!settings) {
    throw new NotFoundError("Settings not found.");
  }

  Object.assign(settings, data);

  settings.updatedBy = new Types.ObjectId(currentUserId);

  await settings.save();

  return settings;
};
export const uploadLogo = async (fileName: string, currentUserId: string) => {
  const settings = await SettingsModel.findOne();

  if (!settings) {
    throw new NotFoundError("Settings not found.");
  }

  settings.logoUrl = `/uploads/company/${fileName}`;

  settings.updatedBy = new Types.ObjectId(currentUserId);

  await settings.save();

  return settings;
};
