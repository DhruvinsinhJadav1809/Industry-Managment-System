import { asyncHandler } from "../../../shared/helpers/async-handler";
import * as dashboardService from "../services/dashboard.service";
import { successResponse } from "../../../shared/response/response.helper";
export const getFinancialSummary = asyncHandler(async (req, res) => {
  const result = await dashboardService.getFinancialSummary();

  return res.json(
    successResponse(result, "Financial summary fetched successfully."),
  );
});
export const getProductProfitability = asyncHandler(async (req, res) => {
  const result = await dashboardService.getProductProfitability();

  return res.json(
    successResponse(result, "Product profitability fetched successfully."),
  );
});
