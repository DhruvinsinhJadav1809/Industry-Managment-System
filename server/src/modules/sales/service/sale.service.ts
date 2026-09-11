import mongoose, { ClientSession, QueryFilter } from "mongoose";
import { CreateSaleDto } from "../dto/create-sales.dto";
import { ProductModel } from "../../products/schemas/product.model";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { InventoryModel } from "../../inventory/schemas/inventory.model";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { SaleModel } from "../schema/sales.schema";
import { getNextSequence } from "../../../shared/counter/service/counter.service";
import UserModel from "../../users/schemas/user.schema";
import { NotificationType } from "../../notification/enums/notification-type.enum";
import { UserRole } from "../../../shared/enums/user-role.enum";
import * as notificationService from "../../notification/services/notification.service";
import { GetSalesQueryDto } from "../dto/get-sales.dto";
import { ISale } from "../types/sales.types";

interface SaleItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  rate: number;
  gstPercentage: number;
  taxAmount: number;
  total: number;
}

export const createSale = async (dto: CreateSaleDto, currentUserId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /**
     * Generate Sale Number
     */
    const saleNumber = await generateSaleNumber(session);

    /**
     * Generate Invoice Number
     */
    const invoiceNumber = await generateInvoiceNumber(session);

    /**
     * Load Products
     */
    const productIds = dto.items.map((item) => item.productId);

    const products = await ProductModel.find(
      {
        _id: {
          $in: productIds,
        },
        isDeleted: false,
        isActive: true,
      },
      null,
      {
        session,
      },
    ).lean();

    /**
     * Validate Products
     */
    if (products.length !== productIds.length) {
      throw new NotFoundError("One or more products not found or inactive.");
    }

    /**
     * Load Inventory
     */
    const inventories = await InventoryModel.find(
      {
        productId: {
          $in: productIds,
        },
        isDeleted: false,
      },
      null,
      {
        session,
      },
    ).lean();

    /**
     * Validate Inventory
     */
    for (const item of dto.items) {
      const inventory = inventories.find(
        (inventory) => inventory.productId.toString() === item.productId,
      );

      if (!inventory) {
        const product = products.find(
          (product) => product._id.toString() === item.productId,
        );

        throw new NotFoundError(
          `Inventory not found for product ${product?.name ?? item.productId}.`,
        );
      }

      if (inventory.quantity < item.quantity) {
        const product = products.find(
          (product) => product._id.toString() === item.productId,
        );

        throw new BadRequestError(
          `Insufficient stock for ${
            product?.name ?? item.productId
          }. Available: ${inventory.quantity}, Requested: ${item.quantity}.`,
        );
      }
    }

    /**
     * Calculate Sale Items and Totals
     */
    let subtotal = 0;
    let totalTax = 0;

    const saleItems: SaleItem[] = [];

    for (const item of dto.items) {
      const product = products.find(
        (product) => product._id.toString() === item.productId,
      );

      if (!product) {
        throw new NotFoundError(`Product not found: ${item.productId}`);
      }

      /**
       * Calculate Line Amount
       */
      const lineSubtotal = item.quantity * item.rate;

      /**
       * Calculate GST
       */
      const taxAmount = (lineSubtotal * item.gstPercentage) / 100;

      /**
       * Calculate Line Total
       */
      const total = lineSubtotal + taxAmount;

      subtotal += lineSubtotal;
      totalTax += taxAmount;

      saleItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        rate: item.rate,
        gstPercentage: item.gstPercentage,
        taxAmount,
        total,
      });
    }

    /**
     * Calculate Discount
     */
    const discountAmount = dto.discountAmount ?? 0;

    if (discountAmount < 0) {
      throw new BadRequestError("discountAmount cannot be negative.");
    }

    /**
     * Validate Discount
     */
    const totalBeforeDiscount = subtotal + totalTax;

    if (discountAmount > totalBeforeDiscount) {
      throw new BadRequestError(
        "discountAmount cannot be greater than sale amount.",
      );
    }

    /**
     * Calculate Grand Total
     */
    const grandTotal = totalBeforeDiscount - discountAmount;

    /**
     * Create Sale
     */
    const sales = await SaleModel.create(
      [
        {
          saleNumber,
          invoiceNumber,

          customerName: dto.customerName,
          customerPhone: dto.customerPhone,

          saleDate: dto.saleDate,

          notes: dto.notes,

          items: saleItems,

          subTotal: subtotal,
          totalTax,
          discountAmount,
          grandTotal,

          paymentMethod: dto.paymentMethod,
          paymentStatus: dto.paymentStatus,

          createdBy: currentUserId,

          isDeleted: false,
        },
      ],
      {
        session,
      },
    );

    const sale = sales[0];

    /**
     * Update Inventory
     *
     * Sale = decrease stock
     *
     * The quantity condition protects
     * against concurrent sales.
     */
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

    const inventoryOperations = dto.items.map((item) => ({
      updateOne: {
        filter: {
          productId: new mongoose.Types.ObjectId(item.productId),

          isDeleted: false,

          quantity: {
            $gte: item.quantity,
          },
        },

        update: {
          $inc: {
            quantity: -item.quantity,
          },

          $set: {
            updatedBy: currentUserObjectId,
          },
        },
      },
    }));

    /**
     * Execute Inventory Updates
     */
    const inventoryResult = await InventoryModel.bulkWrite(
      inventoryOperations,
      {
        session,
      },
    );
    console.log("Inventory result:", {
      matchedCount: inventoryResult.matchedCount,
      modifiedCount: inventoryResult.modifiedCount,
    });

    console.log("Requested items:", dto.items);
    /**
     * Verify Inventory Updates
     */
    if (inventoryResult.modifiedCount !== dto.items.length) {
      throw new BadRequestError(
        "Stock changed while processing the sale. Please try again.",
      );
    }

    /**
     * Commit Transaction
     *
     * At this point:
     * - Sale is created
     * - Sale items are created
     * - Inventory is reduced
     *
     * Everything is committed together.
     */
    await session.commitTransaction();

    /**
     * Send Notification AFTER Transaction Commit
     *
     * Notification failure should not
     * make the successful sale fail.
     */
    try {
      const warehouseUsers = await UserModel.find({
        roleId: UserRole.Employee,
        isDeleted: false,
      }).select("_id");

      const recipients = warehouseUsers.map((user) => user._id.toString());

      if (recipients.length > 0) {
        await notificationService.send({
          title: "Stock Sold",

          message: `Sale ${sale.saleNumber} created successfully.`,

          type: NotificationType.SALE,

          recipients,

          metadata: {
            saleId: sale._id.toString(),
          },

          actionUrl: `/sales/${sale._id.toString()}`,

          createdBy: currentUserId,
        });
      }
    } catch (notificationError) {
      /**
       * Notification failure should not
       * rollback the sale transaction.
       */
      console.error("Failed to send sale notification:", notificationError);
    }

    return sale;
  } catch (error) {
    /**
     * Rollback Transaction
     */
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    /**
     * Close Session
     */
    await session.endSession();
  }
};

/**
 * Generate Sale Number
 */
export const generateSaleNumber = async (session: ClientSession) => {
  const sequence = await getNextSequence("sale", session);

  return `SAL${sequence.toString().padStart(6, "0")}`;
};

/**
 * Generate Invoice Number
 */
export const generateInvoiceNumber = async (session: ClientSession) => {
  const sequence = await getNextSequence("invoice", session);

  return `INV${sequence.toString().padStart(6, "0")}`;
};
export const getSales = async (query: GetSalesQueryDto) => {
  const {
    page = 1,
    pageSize = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
  } = query;

  const filter: QueryFilter<ISale> = {
    isDeleted: false,
  };

  if (search) {
    filter.$or = [
      {
        saleNumber: {
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

  if (status) {
    filter.paymentStatus = status;
  }

  const total = await SaleModel.countDocuments(filter);

  const sales = await SaleModel.find(filter)
    .sort({
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return {
    data: sales,

    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
