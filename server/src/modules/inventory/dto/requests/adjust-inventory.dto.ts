export enum StockAdjustmentType {
  IN = "IN",
  OUT = "OUT",
}

export interface AdjustInventoryDto {
  type: StockAdjustmentType;
  quantity: number;
  reason: string;
}
