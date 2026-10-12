import mongoose, { ClientSession, QueryFilter, Types } from "mongoose";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { ConflictError } from "../../../shared/errors/conflict.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { getNextSequence } from "../../../shared/counter/service/counter.service";
import { mailService } from "../../../shared/email/mail.service";
import { buildOrderEmailTemplate } from "../../../shared/email/templates/order-email.template";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { InventoryModel } from "../../inventory/schemas/inventory.model";
import { NotificationType } from "../../notification/enums/notification-type.enum";
import * as notificationService from "../../notification/services/notification.service";
import { ProductModel } from "../../products/schemas/product.model";
import UserModel from "../../users/schemas/user.schema";
import { OrderStatus } from "../constants/order-status.enum";
import { OrderModel } from "../schemas/order.schema";
import { GetOrdersQueryDto } from "../dto/get-orders.dto";
import { IOrder, IOrderItem } from "../types/order.types";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface ApprovedOrderItemInput {
  productId: string;
  approvedQuantity: number;
}

export const getOrders = async (
  query: GetOrdersQueryDto,
  currentUserId: string,
  roleId: number,
) => {
  const {
    page = 1,
    pageSize = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
  } = query;

  const filter: QueryFilter<IOrder> = { isDeleted: false };
  if (roleId === UserRole.Customer) {
    filter.customerId = new Types.ObjectId(currentUserId);
  }
  if (status) filter.status = status;
  if (search) {
    filter.orderNumber = { $regex: search, $options: "i" };
  }

  const [totalRecords, orders] = await Promise.all([
    OrderModel.countDocuments(filter),
    OrderModel.find(filter)
      .populate("customerId", "fullName email")
      .populate("items.productId", "name sku productCode")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  return {
    items: orders,
    page,
    pageSize,
    totalRecords,
    totalPages: Math.ceil(totalRecords / pageSize),
  };
};

export const getOrderSummary = async () => {
  const statusCounts = Object.fromEntries(
    Object.values(OrderStatus).map((status) => [status, 0]),
  ) as Record<OrderStatus, number>;

  const results = await OrderModel.aggregate<{
    _id: OrderStatus;
    count: number;
  }>([
    { $match: { isDeleted: false } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  for (const result of results) {
    statusCounts[result._id] = result.count;
  }

  return {
    totalOrders: Object.values(statusCounts).reduce(
      (total, count) => total + count,
      0,
    ),
    pendingOrders: statusCounts[OrderStatus.Pending],
    approvedOrders: statusCounts[OrderStatus.Approved],
    billedOrders: statusCounts[OrderStatus.Billed],
    cancelledOrders: statusCounts[OrderStatus.Cancelled],
    statusCounts,
  };
};

const getOrderItems = async (
  items: OrderItemInput[],
  session: ClientSession,
) => {
  const products = await ProductModel.find({
    _id: { $in: items.map((item) => item.productId) },
    isActive: true,
    isDeleted: false,
  })
    .session(session)
    .select("_id sellingPrice name");

  if (products.length !== items.length) {
    throw new BadRequestError("One or more products are unavailable.");
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const orderItems = [];

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product)
      throw new BadRequestError("One or more products are unavailable.");

    orderItems.push({
      productId: new Types.ObjectId(item.productId),
      requestedQuantity: item.quantity,
      approvedQuantity: 0,
      unitPrice: product.sellingPrice,
    });
  }

  return orderItems;
};

const changeInventoryReservation = async (
  productId: Types.ObjectId,
  quantityDelta: number,
  session: ClientSession,
) => {
  if (quantityDelta === 0) return;

  const filter: Record<string, unknown> = {
    productId,
    isDeleted: false,
  };
  if (quantityDelta > 0) {
    filter.$expr = {
      $gte: [
        {
          $subtract: ["$quantity", { $ifNull: ["$reservedQuantity", 0] }],
        },
        quantityDelta,
      ],
    };
  } else {
    filter.reservedQuantity = { $gte: -quantityDelta };
  }

  const result = await InventoryModel.updateOne(
    filter,
    { $inc: { reservedQuantity: quantityDelta } },
    { session },
  );
  if (result.modifiedCount !== 1) {
    if (quantityDelta > 0) {
      throw new BadRequestError(
        `Requested quantity is not available for product.`,
      );
    }
    throw new ConflictError(
      "The order stock reservation has changed. Refresh and retry.",
    );
  }
};

const syncOrderReservations = async (
  previousItems: IOrderItem[],
  nextItems: IOrderItem[],
  session: ClientSession,
) => {
  const previousQuantities = new Map(
    previousItems.map((item) => [
      item.productId.toString(),
      item.requestedQuantity,
    ]),
  );
  const nextQuantities = new Map(
    nextItems.map((item) => [
      item.productId.toString(),
      item.requestedQuantity,
    ]),
  );
  const productIds = [
    ...new Set([...previousQuantities.keys(), ...nextQuantities.keys()]),
  ].sort();

  for (const productId of productIds) {
    const quantityDelta =
      (nextQuantities.get(productId) ?? 0) -
      (previousQuantities.get(productId) ?? 0);
    await changeInventoryReservation(
      new Types.ObjectId(productId),
      quantityDelta,
      session,
    );
  }
};

const isTransactionConflict = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) return false;
  const mongoError = error as {
    code?: number;
    hasErrorLabel?: (label: string) => boolean;
  };
  return (
    mongoError.code === 112 ||
    mongoError.code === 251 ||
    mongoError.hasErrorLabel?.("TransientTransactionError") === true
  );
};

const getProductNames = async (productIds: Types.ObjectId[]) => {
  try {
    const products = await ProductModel.find({ _id: { $in: productIds } })
      .select("_id name")
      .lean();
    return new Map(
      products.map((product) => [product._id.toString(), product.name]),
    );
  } catch (error) {
    console.error(
      "Failed to load product names for order notification:",
      error,
    );
    return new Map<string, string>();
  }
};

const getProductName = (
  productNames: Map<string, string>,
  productId: Types.ObjectId,
) => productNames.get(productId.toString()) ?? "Unavailable product";

const notifyAdmins = async (
  order: {
    id: string;
    orderNumber: string;
    items: Array<{
      productId: Types.ObjectId;
      requestedQuantity: number;
      approvedQuantity: number;
    }>;
  },
  customerId: string,
  customerName: string,
  event: "created" | "modified" | "cancelled",
) => {
  let admins;
  try {
    admins = await UserModel.find({
      roleId: UserRole.Admin,
      isActive: true,
      isDeleted: false,
    }).select("_id email");
  } catch (error) {
    console.error("Failed to find admins for customer order update:", error);
    return;
  }
  if (admins.length === 0) return;

  const productNames = await getProductNames(
    order.items.map((item) => item.productId),
  );
  const itemSummary = order.items
    .map(
      (item) =>
        `${getProductName(productNames, item.productId)}: requested ${item.requestedQuantity}`,
    )
    .join("; ");
  const message = `Order ${order.orderNumber} was ${event} by ${customerName}. ${itemSummary}`;
  try {
    await notificationService.send({
      title: `Customer order ${event}`,
      message,
      type: NotificationType.ORDER,
      recipients: admins.map((admin) => admin.id),
      metadata: {
        orderId: order.id,
        items: order.items.map((item) => ({
          productId: item.productId.toString(),
          requestedQuantity: item.requestedQuantity,
        })),
      },
      createdBy: customerId,
    });
  } catch (error) {
    console.error("Failed to send customer order notification:", error);
  }

  try {
    await mailService.send({
      to: admins.map((admin) => admin.email).join(","),
      subject: `Customer order ${event}: ${order.orderNumber}`,
      html: buildOrderEmailTemplate({
        customerName,
        orderNumber: order.orderNumber,
        event,
        items: order.items.map((item) => ({
          productName: getProductName(productNames, item.productId),
          requestedQuantity: item.requestedQuantity,
        })),
      }),
    });
  } catch (error) {
    console.error("Failed to email customer order update:", error);
  }
};

export const createOrder = async (
  items: OrderItemInput[],
  customerId: string,
  customerName: string,
) => {
  const session = await mongoose.startSession();
  let order;
  try {
    session.startTransaction();
    const orderItems = await getOrderItems(items, session);
    await syncOrderReservations([], orderItems, session);

    const sequence = await getNextSequence("order", session);
    const orderNumber = `ORD${sequence.toString().padStart(6, "0")}`;
    [order] = await OrderModel.create(
      [
        {
          orderNumber,
          customerId: new Types.ObjectId(customerId),
          status: OrderStatus.Pending,
          items: orderItems,
          stockReserved: true,
          createdBy: new Types.ObjectId(customerId),
        },
      ],
      { session },
    );
    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (isTransactionConflict(error)) {
      throw new ConflictError(
        "Stock changed while placing the order. Refresh and retry.",
      );
    }
    throw error;
  } finally {
    await session.endSession();
  }

  await notifyAdmins(order, customerId, customerName, "created");
  return order;
};

export const updateOrder = async (
  orderId: string,
  customerId: string,
  customerName: string,
  action: "modify" | "cancel",
  items?: OrderItemInput[],
) => {
  const session = await mongoose.startSession();
  let updatedOrder;
  try {
    session.startTransaction();
    const order = await OrderModel.findOne({
      _id: orderId,
      customerId,
      isDeleted: false,
    }).session(session);
    if (!order) throw new NotFoundError("Order not found.");
    if (order.status !== OrderStatus.Pending) {
      throw new ConflictError(
        "Order is already processed by the admin and cannot be modified or cancelled.",
      );
    }

    const claimedOrder = await OrderModel.findOneAndUpdate(
      {
        _id: orderId,
        customerId,
        status: OrderStatus.Pending,
        isDeleted: false,
      },
      {
        $set: {
          updatedBy: new Types.ObjectId(customerId),
          updatedAt: new Date(),
          ...(action === "cancel" ? { status: OrderStatus.Cancelled } : {}),
        },
      },
      { new: true, session },
    );
    if (!claimedOrder) {
      throw new ConflictError(
        "The order was already changed. Refresh and retry.",
      );
    }

    if (action === "cancel") {
      if (order.stockReserved) {
        await syncOrderReservations(order.items, [], session);
      }
      claimedOrder.stockReserved = false;
    } else {
      if (!items) throw new BadRequestError("Order items are required.");
      const updatedItems = await getOrderItems(items, session);
      await syncOrderReservations(
        order.stockReserved ? order.items : [],
        updatedItems,
        session,
      );
      claimedOrder.items = updatedItems;
      claimedOrder.stockReserved = true;
    }

    claimedOrder.updatedBy = new Types.ObjectId(customerId);
    updatedOrder = await claimedOrder.save({ session });
    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (isTransactionConflict(error)) {
      throw new ConflictError(
        "The order was already changed. Refresh and retry.",
      );
    }
    throw error;
  } finally {
    await session.endSession();
  }

  await notifyAdmins(
    updatedOrder,
    customerId,
    customerName,
    action === "cancel" ? "cancelled" : "modified",
  );
  return updatedOrder;
};

export const acceptOrder = async (
  orderId: string,
  adminId: string,
  approvedItems: ApprovedOrderItemInput[],
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const order = await OrderModel.findOne({
      _id: orderId,
      isDeleted: false,
    }).session(session);
    if (!order) throw new NotFoundError("Order not found.");
    if (order.status !== OrderStatus.Pending) {
      throw new ConflictError("Only pending orders can be approved.");
    }

    if (
      approvedItems.length !== order.items.length ||
      order.items.some(
        (item) =>
          !approvedItems.some(
            (approved) => approved.productId === item.productId.toString(),
          ),
      )
    ) {
      throw new BadRequestError(
        "Approval quantities must be provided for every ordered product.",
      );
    }

    const approvedOrderItems = order.items.map((item) => {
      const approvedQuantity = approvedItems.find(
        (approved) => approved.productId === item.productId.toString(),
      )!.approvedQuantity;
      if (approvedQuantity > item.requestedQuantity) {
        throw new BadRequestError(
          "Approved quantity cannot exceed requested quantity.",
        );
      }
      return {
        productId: item.productId,
        requestedQuantity: item.requestedQuantity,
        approvedQuantity,
        unitPrice: item.unitPrice,
      };
    });

    const claimedOrder = await OrderModel.findOneAndUpdate(
      {
        _id: orderId,
        status: OrderStatus.Pending,
        isDeleted: false,
      },
      {
        $set: {
          status: OrderStatus.Approved,
          items: approvedOrderItems,
          stockReserved: false,
          updatedBy: new Types.ObjectId(adminId),
        },
      },
      { new: true, session },
    );
    if (!claimedOrder) {
      throw new ConflictError(
        "The order was already changed. Refresh and retry.",
      );
    }

    for (const item of order.items) {
      const approvedQuantity = approvedItems.find(
        (approved) => approved.productId === item.productId.toString(),
      )!.approvedQuantity;
      if (approvedQuantity === 0 && !order.stockReserved) continue;

      const inventoryFilter: Record<string, unknown> = {
        productId: item.productId,
        isDeleted: false,
        quantity: { $gte: approvedQuantity },
      };
      if (order.stockReserved) {
        inventoryFilter.reservedQuantity = {
          $gte: item.requestedQuantity,
        };
      }

      const inventoryUpdate = await InventoryModel.updateOne(
        inventoryFilter,
        {
          $inc: {
            quantity: -approvedQuantity,
            ...(order.stockReserved
              ? { reservedQuantity: -item.requestedQuantity }
              : {}),
          },
          $set: { updatedBy: new Types.ObjectId(adminId) },
        },
        { session },
      );
      if (inventoryUpdate.modifiedCount !== 1) {
        throw new BadRequestError(
          "Stock reservation changed before approval. Refresh the order and retry.",
        );
      }
    }

    await session.commitTransaction();

    try {
      const productNames = await getProductNames(
        claimedOrder.items.map((item) => item.productId),
      );
      await notificationService.send({
        title: "Order approved",
        message: `Order ${claimedOrder.orderNumber} was approved. ${claimedOrder.items
          .map(
            (item) =>
              `${getProductName(productNames, item.productId)}: requested ${item.requestedQuantity}, approved ${item.approvedQuantity}`,
          )
          .join("; ")}`,
        type: NotificationType.ORDER,
        recipients: [claimedOrder.customerId.toString()],
        metadata: {
          orderId: claimedOrder.id,
          items: claimedOrder.items.map((item) => ({
            productId: item.productId.toString(),
            requestedQuantity: item.requestedQuantity,
            approvedQuantity: item.approvedQuantity,
          })),
        },
        createdBy: adminId,
      });
    } catch (error) {
      console.error("Failed to notify customer about order approval:", error);
    }

    return claimedOrder;
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (isTransactionConflict(error)) {
      throw new ConflictError(
        "The order was already changed. Refresh and retry.",
      );
    }
    throw error;
  } finally {
    await session.endSession();
  }
};
