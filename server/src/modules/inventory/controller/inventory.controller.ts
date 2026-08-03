import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import { GetInventoryQueryDto } from "../dto/requests/get-inventory.dto";
import * as inventoryService from "../services/inventory.service";

export const getInventories = asyncHandler(async (req, res) => {
  const inventories = await inventoryService.getInventories(
    req.query as unknown as GetInventoryQueryDto,
  );

  return res.json(successResponse(inventories));
});

export const getInventoryById = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.getInventoryById(
    String(req.params.id),
  );

  return res.json(successResponse(inventory));
});
export const updateInventory = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.updateInventory(
    String(req.params.id),
    req.body,
    req.user.id,
  );

  return res.json(
    successResponse(inventory, "Inventory updated successfully."),
  );
});
export const adjustInventory = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.adjustInventory(
    String(req.params.id),
    req.body,
    req.user.id,
  );

  return res.json(
    successResponse(inventory, "Inventory adjusted successfully."),
  );
});
export const getLowStockInventory = asyncHandler(async (req, res) => {
  const inventories = await inventoryService.getLowStockInventory();

  return res.json(successResponse(inventories));
});
