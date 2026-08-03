export interface CreateInventoryDto {
  productId: string;
  quantity?: number;
  minimumStock: number;
  maximumStock?: number;
  location?: string;
}
