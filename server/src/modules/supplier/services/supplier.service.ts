import { QueryFilter, SortOrder } from "mongoose";

import SupplierModel from "../schemas/supplier.schema";

import { ISupplier } from "../types/supplier.types";

import { ConflictError } from "../../../shared/errors/conflict.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";

import { SUPPLIER_SEARCH_FIELDS } from "../constants/supplier.constants";
import { CreateSupplierDto } from "../dto/requests/create-supplier-dto";
import { SupplierResponseDto } from "../dto/responses/supplier-response-dto";
import { toSupplierResponseDto } from "../../../shared/mappers/supplier.mapper";
import { PaginatedResponseDto } from "../../../shared/types/paginated-response.dto";
import { GetSuppliersQueryDto } from "../dto/responses/get-supplier-query-dto";
import { UpdateSupplierDto } from "../dto/requests/update-supplier-dto";
import { ExcelService } from "../../../shared/excel/excel.service";
import { Response as ExpressResponse } from "express";
export const createSupplier = async (
  data: CreateSupplierDto,
  currentUserId: string,
): Promise<SupplierResponseDto> => {
  const existingSupplier = await SupplierModel.findOne({
    isDeleted: false,
    $or: [{ code: data.code }, ...(data.email ? [{ email: data.email }] : [])],
  });

  if (existingSupplier) {
    throw new ConflictError("Supplier already exists.");
  }

  const supplier = await SupplierModel.create({
    ...data,
    createdBy: currentUserId,
  });

  return toSupplierResponseDto(supplier);
};

export const getSuppliers = async (
  query: GetSuppliersQueryDto,
): Promise<PaginatedResponseDto<SupplierResponseDto>> => {
  const {
    page = 1,
    pageSize = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    isActive,
  } = query;

  const filter: QueryFilter<ISupplier> = {
    isDeleted: false,
  };
  if (isActive !== undefined && isActive !== null) {
    if (typeof isActive === "boolean") {
      filter.isActive = isActive;
    } else if (typeof isActive === "string") {
      if ((isActive as string).toLowerCase() === "true") filter.isActive = true;
      if ((isActive as string).toLowerCase() === "false")
        filter.isActive = false;
    }
  }
  if (search) {
    const regex = new RegExp(search, "i");

    filter.$or = SUPPLIER_SEARCH_FIELDS.map((field) => ({
      [field]: regex,
    }));
  }

  const skip = (page - 1) * pageSize;

  const sort: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [suppliers, totalRecords] = await Promise.all([
    SupplierModel.find(filter).sort(sort).skip(skip).limit(pageSize),

    SupplierModel.countDocuments(filter),
  ]);

  return {
    items: suppliers.map(toSupplierResponseDto),
    page,
    pageSize,
    totalRecords,
    totalPages: Math.ceil(totalRecords / pageSize),
  };
};

export const getSupplierById = async (
  id: string,
): Promise<SupplierResponseDto> => {
  const supplier = await SupplierModel.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!supplier) {
    throw new NotFoundError("Supplier not found.");
  }

  return toSupplierResponseDto(supplier);
};

export const updateSupplier = async (
  id: string,
  data: UpdateSupplierDto,
  currentUserId: string,
): Promise<SupplierResponseDto> => {
  const existingSupplier = await SupplierModel.findOne({
    _id: { $ne: id },
    isDeleted: false,
    $or: [
      ...(data.code ? [{ code: data.code }] : []),
      ...(data.email ? [{ email: data.email }] : []),
    ],
  });

  if (existingSupplier) {
    throw new ConflictError("Supplier already exists.");
  }

  const supplier = await SupplierModel.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      ...data,
      updatedBy: currentUserId,
    },
    {
      new: true,
    },
  );

  if (!supplier) {
    throw new NotFoundError("Supplier not found.");
  }

  return toSupplierResponseDto(supplier);
};

export const deleteSupplier = async (
  id: string,
  currentUserId: string,
): Promise<void> => {
  const supplier = await SupplierModel.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      isDeleted: true,
      isActive: false,
      deletedAt: new Date(),
      deletedBy: currentUserId,
    },
  );

  if (!supplier) {
    throw new NotFoundError("Supplier not found.");
  }
};
export const exportSuppliers = async (res: ExpressResponse): Promise<void> => {
  const suppliers = await SupplierModel.find({
    isDeleted: false,
  }).lean();

  const rows = suppliers.map((supplier) => ({
    name: supplier.name,
    code: supplier.code,
    contactPerson: supplier.contactPerson ?? "-",
    email: supplier.email ?? "-",
    phone: supplier.phone ?? "-",
    city: supplier.city ?? "-",
    state: supplier.state ?? "-",
    country: supplier.country ?? "-",
    status: supplier.isActive ? "Active" : "Inactive",
  }));

  await ExcelService.generateExcel(
    {
      sheetName: "Suppliers",

      fileName: "suppliers",

      columns: [
        {
          header: "Supplier Name",
          key: "name",
          width: 30,
        },
        {
          header: "Supplier Code",
          key: "code",
          width: 18,
        },
        {
          header: "Contact Person",
          key: "contactPerson",
          width: 25,
        },
        {
          header: "Email",
          key: "email",
          width: 35,
        },
        {
          header: "Phone",
          key: "phone",
          width: 20,
        },
        {
          header: "City",
          key: "city",
          width: 20,
        },
        {
          header: "State",
          key: "state",
          width: 20,
        },
        {
          header: "Country",
          key: "country",
          width: 20,
        },
        {
          header: "Status",
          key: "status",
          width: 15,
        },
      ],

      data: rows,
    },
    res,
  );
};
