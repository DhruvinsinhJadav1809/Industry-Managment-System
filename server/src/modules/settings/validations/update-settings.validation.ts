import { createSettingsSchema } from "./create-settings.validation";

export const updateSettingsSchema = createSettingsSchema.partial();
