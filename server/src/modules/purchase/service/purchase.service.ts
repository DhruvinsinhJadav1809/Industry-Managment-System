import mongoose, { QueryFilter } from "mongoose";
import { GetPurchasesQueryDto } from "../dto/responses/get-purchases.dto";
import { IPurchase } from "../types/purchase.types";
import { PurchaseModel } from "../schema/purchase.schema";
import { PurchaseStatus } from "../constants/purchase-status.enum";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { PurchaseItemModel } from "../schema/purchase-item.schema";
import { CreatePurchaseDto } from "../dto/requests/create-purchase.dto";
import { ProductModel } from "../../products/schemas/product.model";
import { InventoryModel } from "../../inventory/schemas/inventory.model";
import { generatePurchaseNumber } from "../../../shared/counter/service/counter.service";
import { Response as ExpressResponse } from "express";
import SupplierModel from "../../supplier/schemas/supplier.schema";
import { ExcelService } from "../../../shared/excel/excel.service";
import * as notificationService from "../../notification/services/notification.service";
import { NotificationType } from "../../notification/enums/notification-type.enum";
import UserModel from "../../users/schemas/user.schema";
import { UserRole } from "../../../shared/enums/user-role.enum";
export const getPurchases = async (query: GetPurchasesQueryDto) => {
  const {
    page = 1,
    pageSize = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    supplierId,
    status,
  } = query;
  const filter: QueryFilter<IPurchase> = {
    isDeleted: false,
  };
  if (search) {
    filter.$or = [
      {
        purchaseNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        invoiceNumber: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }
  if (supplierId) {
    filter.supplierId = supplierId;
  }
  if (status) {
    filter.status = status as PurchaseStatus;
  }
  const total = await PurchaseModel.countDocuments(filter);
  const purchases = await PurchaseModel.find(filter)
    .populate("supplierId", "name code")
    .sort({
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();
  return {
    data: purchases,

    pagination: {
      page,

      pageSize,

      total,

      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const getPurchaseById = async (id: string) => {
  const purchase = await PurchaseModel.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("supplierId", "name code email phone")
    .lean();

  if (!purchase) {
    throw new NotFoundError("Purchase not found.");
  }

  const purchaseItems = await PurchaseItemModel.find({
    purchaseId: purchase._id,
  })
    .populate("productId", "name code")
    .lean();

  return {
    ...purchase,

    items: purchaseItems,
  };
};

export const createPurchase = async (
  dto: CreatePurchaseDto,
  currentUserId: string,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /**
     * Generate Purchase Number
     */
    const purchaseNumber = await generatePurchaseNumber(session);

    /**
     * Validate Supplier
     */
    const supplier = await SupplierModel.findOne(
      {
        _id: dto.supplierId,
        isDeleted: false,
        isActive: true,
      },
      null,
      { session },
    );

    if (!supplier) {
      throw new NotFoundError("Supplier not found.");
    }

    /**
     * Load Products
     */
    const productIds = dto.items.map((x) => x.productId);

    const products = await ProductModel.find(
      {
        _id: {
          $in: productIds,
        },
        isDeleted: false,
        isActive: true,
      },
      null,
      { session },
    ).lean();

    if (products.length !== productIds.length) {
      throw new NotFoundError("One or more products not found.");
    }

    /**
     * Calculate Totals
     */
    let subtotal = 0;
    let totalTax = 0;

    const purchaseItems: any[] = [];

    for (const item of dto.items) {
      const product = products.find((x) => x._id.toString() === item.productId);

      if (!product) {
        throw new NotFoundError("Product not found.");
      }

      const lineSubtotal = item.quantity * item.unitPrice;

      const taxAmount = (lineSubtotal * item.taxPercentage) / 100;

      const lineTotal = lineSubtotal + taxAmount;

      subtotal += lineSubtotal;
      totalTax += taxAmount;

      purchaseItems.push({
        productId: product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxPercentage: item.taxPercentage,
        taxAmount,
        lineTotal,
      });
    }

    const grandTotal = subtotal + totalTax - (dto.discount ?? 0);

    /**
     * Create Purchase
     */
    const purchases = await PurchaseModel.create(
      [
        {
          purchaseNumber,
          supplierId: supplier._id,
          invoiceNumber: dto.invoiceNumber,
          purchaseDate: dto.purchaseDate,
          remarks: dto.remarks,
          subtotal,
          taxAmount: totalTax,
          discount: dto.discount ?? 0,
          grandTotal,
          status: PurchaseStatus.Completed,
          createdBy: currentUserId,
        },
      ],
      {
        session,
      },
    );

    const purchase = purchases[0];

    /**
     * Create Purchase Items
     */
    const purchaseItemDocuments = purchaseItems.map((item) => ({
      ...item,
      purchaseId: purchase._id,
    }));

    await PurchaseItemModel.insertMany(purchaseItemDocuments, {
      session,
    });

    /**
     * Update Inventory
     */
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

    const inventoryOperations = dto.items.map((item) => ({
      updateOne: {
        filter: {
          productId: new mongoose.Types.ObjectId(item.productId),
        },
        update: {
          $inc: {
            quantity: item.quantity,
          },
          $setOnInsert: {
            productId: new mongoose.Types.ObjectId(item.productId),
            createdBy: currentUserObjectId,
          },
          $set: {
            updatedBy: currentUserObjectId,
          },
        },
        upsert: true,
      },
    }));

    await InventoryModel.bulkWrite(inventoryOperations, {
      session,
    });

    /**
     * Commit Transaction
     */
    await session.commitTransaction();
    const warehouseUsers = await UserModel.find({
      roleId: UserRole.Employee,
      isDeleted: false,
    }).select("_id");

    const recipients = warehouseUsers.map((x) => x._id.toString());
    await notificationService.send({
      title: "New Stock Arrived",

      message: `Purchase ${purchase.purchaseNumber} created.`,

      type: NotificationType.PURCHASE,

      recipients: recipients,

      metadata: {
        purchaseId: purchase.id,
      },

      actionUrl: `/purchases/${purchase.id}`,

      createdBy: currentUserId,
    });
    return purchase;
  } catch (error) {
    /**
     * Rollback
     */
    await session.abortTransaction();

    throw error;
  } finally {
    /**
     * Close Session
     */
    await session.endSession();
  }
};

export const exportPurchases = async (res: ExpressResponse): Promise<void> => {
  const purchases = await PurchaseModel.find({
    isDeleted: false,
  })
    .populate("supplierId", "name code")
    .lean();

  const rows = purchases.map((purchase) => ({
    purchaseNumber: purchase.purchaseNumber,
    supplierName: (purchase.supplierId as any)?.name ?? "-",
    supplierCode: (purchase.supplierId as any)?.code ?? "-",
    invoiceNumber: purchase.invoiceNumber ?? "-",
    purchaseDate: purchase.purchaseDate,
    subtotal: purchase.subtotal,
    taxAmount: purchase.taxAmount,
    discount: purchase.discount,
    grandTotal: purchase.grandTotal,
    status: purchase.status,
  }));

  await ExcelService.generateExcel(
    {
      sheetName: "Purchases",

      fileName: "purchases",

      columns: [
        {
          header: "Purchase No",
          key: "purchaseNumber",
          width: 20,
        },
        {
          header: "Supplier",
          key: "supplierName",
          width: 30,
        },
        {
          header: "Supplier Code",
          key: "supplierCode",
          width: 20,
        },
        {
          header: "Invoice No",
          key: "invoiceNumber",
          width: 20,
        },
        {
          header: "Purchase Date",
          key: "purchaseDate",
          width: 18,
        },
        {
          header: "Subtotal",
          key: "subtotal",
          width: 15,
        },
        {
          header: "Tax",
          key: "taxAmount",
          width: 15,
        },
        {
          header: "Discount",
          key: "discount",
          width: 15,
        },
        {
          header: "Grand Total",
          key: "grandTotal",
          width: 18,
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
