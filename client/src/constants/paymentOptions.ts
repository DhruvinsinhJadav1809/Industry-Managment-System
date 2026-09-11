/**
 * Only "UPI" and "PAID" were confirmed in your example payload. The rest
 * of each set is a reasonable guess — adjust these two lists once the
 * real accepted values are confirmed.
 */
export const PAYMENT_METHOD_OPTIONS = ["CASH", "BANK", "UPI", "CARD"] as const;
export const PAYMENT_STATUS_OPTIONS = ["PAID", "PENDING", "PARTIAL"] as const;
