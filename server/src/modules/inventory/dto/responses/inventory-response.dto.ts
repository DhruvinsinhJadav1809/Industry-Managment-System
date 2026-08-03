export interface InventoryResponseDto {
  id: string;

  product: {
    id: string;
    name: string;
    code: string;
  };

  quantity: number;
  minimumStock: number;
  maximumStock?: number | null;
  location?: string;
}
