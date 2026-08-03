import { InventoryResponseDto } from "../../modules/inventory/dto/responses/inventory-response.dto";
import { IInventoryPopulatedDocument } from "../../modules/inventory/types/inventory.types";

export const toInventoryResponseDto = (
  inventory: IInventoryPopulatedDocument,
): InventoryResponseDto => ({
  id: inventory._id.toString(),

  product: {
    id: inventory.productId._id.toString(),
    name: inventory.productId.name,
    code: inventory.productId.productCode,
  },

  quantity: inventory.quantity,
  minimumStock: inventory.minimumStock,
  maximumStock: inventory.maximumStock,
  location: inventory.location,
});
