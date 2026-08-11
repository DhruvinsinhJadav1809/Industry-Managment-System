import { Request, Response } from "express";
import * as purchaseService from "../service/purchase.service";
import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
import { generatePurchasePdf } from "../pdf/purchase-pdf.service";

export const createPurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await purchaseService.createPurchase(req.body, req.user!.id);

    return res.json(successResponse(result, "Purchase created successfully."));
  },
);

export const getPurchases = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await purchaseService.getPurchases(res.locals.validated);
    return res.json(successResponse(result));
  },
);

export const getPurchaseById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await purchaseService.getPurchaseById(String(req.params.id));
    return res.json(successResponse(result));
  },
);
export const downloadPurchasePdf = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.getPurchaseById(String(req.params.id));

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${purchase.purchaseNumber}.pdf`,
  );

  generatePurchasePdf(purchase, res);
});
// export const updatePurchase = asyncHandler(
//   async (req: Request, res: Response) => {
//     const result = await purchaseService.updatePurchase(
//       req.params.id,
//       req.body,
//       req.user!.userId,
//     );
//     return res.json(successResponse(result, "Purchase updated successfully."));
//   },
// );

// export const deletePurchase = asyncHandler(
//   async (req: Request, res: Response) => {
//     await purchaseService.deletePurchase(req.params.id, req.user!.userId);
//     return res.json(successResponse(null, "Purchase deleted successfully."));
//   },
// );

export const exportPurchases = asyncHandler(async (req, res) => {
  await purchaseService.exportPurchases(res);
});
