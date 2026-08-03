export interface CompanySettings {
  companyName: string;
  gstNumber: string;
  logoUrl: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface CreateSettingsPayload {
  companyName: string;
  gstNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

/** PUT /settings accepts a partial update — send only changed fields. */
export type UpdateSettingsPayload = Partial<CreateSettingsPayload>;

export interface UploadLogoResponseData {
  logoUrl: string;
}
