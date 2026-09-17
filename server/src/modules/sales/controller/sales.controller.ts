import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/helpers/async-handler";
import * as saleService from "../service/sale.service";
import { successResponse } from "../../../shared/response/response.helper";
import { generateSalePdf } from "../../purchase/pdf/sale-pdf.service";
export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const result = await saleService.createSale(req.body, req.user!.id);

  return res.json(successResponse(result, "Sale created successfully."));
});
export const getSales = asyncHandler(async (req: Request, res: Response) => {
  const result = await saleService.getSales(res.locals.validated);

  return res.json(successResponse(result));
});
export const updateSalePayment = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await saleService.updateSalePayment(
      String(req.params.id),
      req.body,
      req.user!.id,
    );

    return res.json(
      successResponse(result, "Sale payment updated successfully."),
    );
  },
);
export const exportSales = asyncHandler(async (req, res) => {
  await saleService.exportSales(res);
});
export const getSalesById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await saleService.getSalesById(String(req.params.id));
    return res.json(successResponse(result));
  },
);
export const downloadSalePdf = asyncHandler(async (req, res) => {
  const sales = await saleService.getSalesById(String(req.params.id));

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${sales.customerName}.pdf`,
  );

  generateSalePdf(sales, res);
});
