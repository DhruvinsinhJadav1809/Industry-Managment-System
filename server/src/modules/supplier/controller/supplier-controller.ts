import { Request, Response } from "express";

import * as supplierService from "../services/supplier.service";

import { asyncHandler } from "../../../shared/helpers/async-handler";
import { successResponse } from "../../../shared/response/response.helper";
export const createSupplier = asyncHandler(
  async (req: Request, res: Response) => {
    const supplier = await supplierService.createSupplier(
      req.body,
      req.user.id,
    );

    return res
      .status(201)
      .json(successResponse(supplier, "Supplier created successfully."));
  },
);

export const getSuppliers = asyncHandler(
  async (req: Request, res: Response) => {
    const suppliers = await supplierService.getSuppliers(req.query);

    return res.json(
      successResponse(suppliers, "Suppliers retrieved successfully."),
    );
  },
);

export const getSupplierById = asyncHandler(
  async (req: Request, res: Response) => {
    const supplier = await supplierService.getSupplierById(
      String(req.params.id),
    );

    return res.json(
      successResponse(supplier, "Supplier retrieved successfully."),
    );
  },
);

export const updateSupplier = asyncHandler(
  async (req: Request, res: Response) => {
    const supplier = await supplierService.updateSupplier(
      String(req.params.id),
      req.body,
      req.user.id,
    );

    return res.json(
      successResponse(supplier, "Supplier updated successfully."),
    );
  },
);

export const deleteSupplier = asyncHandler(
  async (req: Request, res: Response) => {
    await supplierService.deleteSupplier(String(req.params.id), req.user.id);

    return res.json(successResponse(null, "Supplier deleted successfully."));
  },
);

export const exportSuppliers = asyncHandler(async (req, res) => {
  await supplierService.exportSuppliers(res);
});
