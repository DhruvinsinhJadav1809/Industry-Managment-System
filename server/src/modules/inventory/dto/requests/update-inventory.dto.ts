export interface UpdateInventoryDto {
  minimumStock?: number;
  maximumStock?: number | null;
  location?: string;
}
