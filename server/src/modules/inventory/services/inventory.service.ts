import { QueryFilter, Types } from "mongoose";
import { InventoryModel } from "../schemas/inventory.model";
import { GetInventoryQueryDto } from "../dto/requests/get-inventory.dto";
import { InventoryResponseDto } from "../dto/responses/inventory-response.dto";
import {
  IInventoryDocument,
  IInventoryPopulatedDocument,
} from "../types/inventory.types";
import { PaginatedResponseDto } from "../../../shared/types/paginated-response.dto";
import { ProductModel } from "../../products/schemas/product.model";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { toInventoryResponseDto } from "../../../shared/mappers/inventory.mapper";
import { UpdateInventoryDto } from "../dto/requests/update-inventory.dto";
import { INVENTORY_PRODUCT_POPULATE } from "../constants/inventory.constant";
import {
  AdjustInventoryDto,
  StockAdjustmentType,
} from "../dto/requests/adjust-inventory.dto";
import { BadRequestError } from "../../../shared/errors/bad-request.error";

export const createInventoryForProduct = async (
  productId: string,
  currentUserId: string,
): Promise<void> => {
  await InventoryModel.create({
    productId: new Types.ObjectId(productId),
    quantity: 0,
    minimumStock: 0,
    maximumStock: null,
    createdBy: new Types.ObjectId(currentUserId),
  });
};

export const getInventories = async (
  query: GetInventoryQueryDto,
): Promise<PaginatedResponseDto<InventoryResponseDto>> => {
  const {
    page = 1,
    pageSize = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter: QueryFilter<IInventoryDocument> = {
    isDeleted: false,
  };

  if (search) {
    const products = await ProductModel.find({
      name: { $regex: search, $options: "i" },
      isDeleted: false,
    }).select("_id");

    filter.productId = {
      $in: products.map((x) => x._id),
    };
  }

  const totalRecords = await InventoryModel.countDocuments(filter);

  const inventories = await InventoryModel.find(filter)
    .populate(INVENTORY_PRODUCT_POPULATE)
    .sort({
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean<IInventoryPopulatedDocument[]>();

  return {
    items: inventories.map(toInventoryResponseDto),
    page,
    pageSize,
    totalRecords,
    totalPages: Math.ceil(totalRecords / pageSize),
  };
};

export const getInventoryById = async (
  inventoryId: string,
): Promise<InventoryResponseDto> => {
  const inventory = await InventoryModel.findOne({
    _id: inventoryId,
    isDeleted: false,
  })
    .populate(INVENTORY_PRODUCT_POPULATE)
    .lean<IInventoryPopulatedDocument>();

  if (!inventory) {
    throw new NotFoundError("Inventory not found.");
  }

  return toInventoryResponseDto(inventory);
};
export const updateInventory = async (
  inventoryId: string,
  data: UpdateInventoryDto,
  currentUserId: string,
): Promise<InventoryResponseDto> => {
  const inventory = await InventoryModel.findOne({
    _id: inventoryId,
    isDeleted: false,
  });

  if (!inventory) {
    throw new NotFoundError("Inventory not found.");
  }

  if (data.minimumStock !== undefined)
    inventory.minimumStock = data.minimumStock;

  if (data.maximumStock !== undefined)
    inventory.maximumStock = data.maximumStock;

  if (data.location !== undefined) inventory.location = data.location;

  inventory.updatedBy = new Types.ObjectId(currentUserId);

  await inventory.save();

  await inventory.populate(INVENTORY_PRODUCT_POPULATE);

  return toInventoryResponseDto(
    inventory.toObject() as unknown as IInventoryPopulatedDocument,
  );
};

export const adjustInventory = async (
  inventoryId: string,
  data: AdjustInventoryDto,
  currentUserId: string,
): Promise<InventoryResponseDto> => {
  const inventory = await InventoryModel.findOne({
    productId: inventoryId,
    isDeleted: false,
  });

  if (!inventory) {
    throw new NotFoundError("Inventory not found.");
  }

  if (data.type === StockAdjustmentType.IN) {
    inventory.quantity += data.quantity;
  } else {
    if (inventory.quantity < data.quantity) {
      throw new BadRequestError("Insufficient inventory quantity.");
    }

    inventory.quantity -= data.quantity;
  }

  inventory.updatedBy = new Types.ObjectId(currentUserId);

  await inventory.save();

  await inventory.populate(INVENTORY_PRODUCT_POPULATE);

  // Next Sprint:
  // await createInventoryTransaction(...);

  return toInventoryResponseDto(
    inventory.toObject() as unknown as IInventoryPopulatedDocument,
  );
};
export const getLowStockInventory = async (): Promise<
  InventoryResponseDto[]
> => {
  const inventories = await InventoryModel.find({
    isDeleted: false,
    $expr: {
      $lte: ["$quantity", "$minimumStock"],
    },
  })
    .populate(INVENTORY_PRODUCT_POPULATE)
    .lean<IInventoryPopulatedDocument[]>();

  return inventories.map(toInventoryResponseDto);
};
