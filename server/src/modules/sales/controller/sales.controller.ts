import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/helpers/async-handler";
import * as saleService from "../service/sale.service";
import { successResponse } from "../../../shared/response/response.helper";
export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const result = await saleService.createSale(req.body, req.user!.id);

  return res.json(successResponse(result, "Sale created successfully."));
});
export const getSales = asyncHandler(async (req: Request, res: Response) => {
  const result = await saleService.getSales(res.locals.validated);

  return res.json(successResponse(result));
});
