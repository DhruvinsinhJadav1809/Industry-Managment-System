export type OrderMailEvent = "created" | "modified" | "cancelled";

export interface OrderMailTemplateOptions {
  customerName: string;
  orderNumber: string;
  event: OrderMailEvent;
  items: Array<{
    productName: string;
    requestedQuantity: number;
  }>;
}
