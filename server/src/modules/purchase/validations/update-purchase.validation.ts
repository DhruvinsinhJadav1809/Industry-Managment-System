import { createPurchaseSchema } from "./create-purchase.validation";

export const updatePurchaseSchema = createPurchaseSchema.partial();
