import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import * as orderService from "../services/order.service";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(
    req.body.items,
    req.user!.id,
    req.user!.fullName,
  );
  return res.json(successResponse(order, "Order created successfully."));
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await orderService.getOrders(
    res.locals.validated,
    req.user!.id,
    req.user!.roleId,
  );
  return res.json(successResponse(orders));
});

export const getOrderSummary = asyncHandler(
  async (_req: Request, res: Response) => {
    const summary = await orderService.getOrderSummary();
    return res.json(
      successResponse(summary, "Order summary retrieved successfully."),
    );
  },
);

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrder(
    String(req.params.id),
    req.user!.id,
    req.user!.fullName,
    req.body.action,
    req.body.items,
  );
  return res.json(successResponse(order, "Order updated successfully."));
});

export const acceptOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.acceptOrder(
    String(req.params.id),
    req.user!.id,
    req.body.items,
  );
  return res.json(successResponse(order, "Order approved successfully."));
});
