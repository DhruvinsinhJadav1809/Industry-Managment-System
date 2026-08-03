export interface CreateSettingsDto {
  companyName: string;
  gstNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}
