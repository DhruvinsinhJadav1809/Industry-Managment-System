/**
 * Only "ONLINE" was confirmed in the example payload. The rest are a
 * reasonable guess — adjust once the real accepted set is confirmed.
 */
export const PAYMENT_TYPE_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "ONLINE", label: "Online" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CARD", label: "Card" },
] as const;
