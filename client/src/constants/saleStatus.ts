export const SALE_STATUS_OPTIONS = ["PAID", "PENDING", "CANCELLED"] as const;

export function saleStatusTone(
  status: string,
): "signal" | "amber" | "red" | "neutral" {
  switch (status.toUpperCase()) {
    case "PAID":
      return "signal";

    case "PENDING":
      return "amber";

    case "CANCELLED":
      return "red";

    default:
      return "neutral";
  }
}
