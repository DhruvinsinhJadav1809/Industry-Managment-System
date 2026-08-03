import { QueryFilter, SortOrder, Types } from "mongoose";
import { ConflictError } from "../../../shared/errors/conflict.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import DepartmentModel from "../../departments/schemas/department.schema";
import { ProductModel } from "../schemas/product.model";
import { CreateProductDto } from "../dto/requests/create-product.dto";
import { ProductResponseDto } from "../dto/responses/product-response.dto";
import {
  IProductDocument,
  IProductPopulatedDocument,
} from "../types/product.types";
import { PRODUCT_DEPARTMENT_POPULATE } from "../constants/product.constants";
import { toProductResponseDto } from "../../../shared/mappers/product.mapper";
import { GetProductsQueryDto } from "../dto/responses/get-products-query.dto";
import { PaginatedResponseDto } from "../../../shared/types/paginated-response.dto";
import { UpdateProductDto } from "../dto/requests/update-product.dto";
import * as inventoryService from "../../inventory/services/inventory.service";

export const createProduct = async (
  data: CreateProductDto,
  currentUserId: string,
): Promise<ProductResponseDto> => {
  const normalizedName = data.name.trim();
  const normalizedSku = data.sku.trim().toUpperCase();
  const normalizeProductCode = data.productCode.trim().toUpperCase();

  const [existingProduct, department] = await Promise.all([
    ProductModel.findOne({
      isDeleted: false,
      $or: [
        { name: normalizedName },
        { sku: normalizedSku },
        { productCode: normalizeProductCode },
      ],
    }).select("name sku productCode"),

    DepartmentModel.findOne({
      _id: data.departmentId,
      isDeleted: false,
    }).select("name code isActive"),
  ]);

  if (existingProduct?.name === normalizedName) {
    throw new ConflictError("Product name already exists.");
  }

  if (existingProduct?.sku === normalizedSku) {
    throw new ConflictError("Product SKU already exists.");
  }
  if (existingProduct?.productCode === normalizeProductCode) {
    throw new ConflictError("Product code already exists.");
  }

  if (!department) {
    throw new NotFoundError("Department not found.");
  }

  if (!department.isActive) {
    throw new BadRequestError("Selected department is inactive.");
  }

  const product = await ProductModel.create({
    ...data,
    name: normalizedName,
    sku: normalizedSku,
    productCode: normalizeProductCode,
    createdBy: new Types.ObjectId(currentUserId),
  });
  await inventoryService.createInventoryForProduct(
    product._id.toString(),
    currentUserId,
  );
  await product.populate(PRODUCT_DEPARTMENT_POPULATE);

  return toProductResponseDto(
    product.toObject() as unknown as IProductPopulatedDocument,
  );
};

export const getProducts = async (
  query: GetProductsQueryDto,
): Promise<PaginatedResponseDto<ProductResponseDto>> => {
  const {
    page = 1,
    pageSize = 10,
    search,
    departmentId,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (page - 1) * pageSize;

  const filter: QueryFilter<IProductDocument> = {
    isDeleted: false,
  };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
      { productCode: { $regex: search, $options: "i" } },
    ];
  }

  if (departmentId) {
    filter.departmentId = departmentId;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  const sort: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? "asc" : "desc",
  };

  const [products, totalRecords] = await Promise.all([
    ProductModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .populate(PRODUCT_DEPARTMENT_POPULATE)
      .lean<IProductPopulatedDocument[]>(),

    ProductModel.countDocuments(filter),
  ]);

  return {
    items: products.map(toProductResponseDto),
    page,
    pageSize,
    totalRecords,
    totalPages: Math.ceil(totalRecords / pageSize),
  };
};

export const getProductById = async (
  productId: string,
): Promise<ProductResponseDto> => {
  const product = await ProductModel.findOne({
    _id: productId,
    isDeleted: false,
  })
    .populate(PRODUCT_DEPARTMENT_POPULATE)
    .lean<IProductPopulatedDocument>();

  if (!product) {
    throw new NotFoundError("Product not found.");
  }

  return toProductResponseDto(product);
};

export const deleteProduct = async (
  productId: string,
  currentUserId: string,
): Promise<void> => {
  const product = await ProductModel.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new NotFoundError("Product not found.");
  }

  product.isDeleted = true;
  product.deletedAt = new Date();
  product.deletedBy = new Types.ObjectId(currentUserId);

  await product.save();
};

export const updateProduct = async (
  productId: string,
  data: UpdateProductDto,
  currentUserId: string,
): Promise<ProductResponseDto> => {
  const normalizedName = data.name.trim();
  const normalizedSku = data.sku.trim().toUpperCase();
  const normalizeProductCode = data.productCode.trim().toUpperCase();
  const duplicateConditions = [];

  duplicateConditions.push({ name: normalizedName });
  duplicateConditions.push({ sku: normalizedSku });
  duplicateConditions.push({ productCode: normalizeProductCode });

  const [product, duplicateProduct, department] = await Promise.all([
    ProductModel.findOne({
      _id: productId,
      isDeleted: false,
    }),

    ProductModel.findOne({
      _id: { $ne: productId },
      isDeleted: false,
      $or: duplicateConditions,
    })
      .select("name sku productCode")
      .lean(),

    DepartmentModel.findOne({
      _id: data.departmentId,
      isDeleted: false,
    })
      .select("name code isActive")
      .lean(),
  ]);

  if (!product) {
    throw new NotFoundError("Product not found.");
  }

  if (duplicateProduct?.name === normalizedName) {
    throw new ConflictError("Product name already exists.");
  }

  if (duplicateProduct?.sku === normalizedSku) {
    throw new ConflictError("Product SKU already exists.");
  }
  if (duplicateProduct?.productCode === normalizeProductCode) {
    throw new ConflictError("Product Product code already exists.");
  }

  if (!department) {
    throw new NotFoundError("Department not found.");
  }

  if (!department.isActive) {
    throw new BadRequestError("Selected department is inactive.");
  }

  product.name = normalizedName;
  product.sku = normalizedSku;
  product.productCode = normalizeProductCode;
  product.departmentId = new Types.ObjectId(data.departmentId);
  product.description = data.description;
  product.unit = data.unit;
  product.costPrice = data.costPrice;
  product.sellingPrice = data.sellingPrice;
  product.isActive = data.isActive;
  product.updatedBy = new Types.ObjectId(currentUserId);

  await product.save();

  await product.populate(PRODUCT_DEPARTMENT_POPULATE);

  return toProductResponseDto(
    product.toObject() as unknown as IProductPopulatedDocument,
  );
};
