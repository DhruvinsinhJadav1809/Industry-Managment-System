/**
 * Only "Completed" was confirmed in the API examples. "Pending" and
 * "Cancelled" are a reasonable guess at the rest of a purchase-order
 * lifecycle — adjust this list once the real set of statuses is confirmed.
 */
export const PURCHASE_STATUS_OPTIONS = [
  "Completed",
  "Pending",
  "Cancelled",
] as const;

export function purchaseStatusTone(
  status: string,
): "signal" | "amber" | "red" | "neutral" {
  switch (status) {
    case "Completed":
      return "signal";
    case "Pending":
      return "amber";
    case "Cancelled":
      return "red";
    default:
      return "neutral";
  }
}
