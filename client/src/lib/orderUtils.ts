import type { CustomerOrder, OrderItem } from "../types/order";

export function getOrderProductId(productId: OrderItem["productId"]): string {
  return typeof productId === "string" ? productId : productId._id;
}

export function getOrderProductName(item: OrderItem): string {
  if (item.productName) return item.productName;
  if (typeof item.productId !== "string") return item.productId.name;
  return `Product ${item.productId}`;
}

export function getOrderProductCode(item: OrderItem): string {
  if (item.productCode) return item.productCode;
  if (typeof item.productId !== "string") {
    return item.productId.productCode ?? item.productId.sku ?? "";
  }
  return "";
}

export function getOrderCustomerName(order: CustomerOrder): string {
  if (order.customerName) return order.customerName;
  if (typeof order.customerId !== "string") return order.customerId.fullName;
  return `Customer ${order.customerId}`;
}

export function getOrderCustomerPhone(order: CustomerOrder): string {
  if (order.customerPhone) return order.customerPhone;
  if (typeof order.customerId !== "string") return order.customerId.phone ?? "";
  return "";
}
