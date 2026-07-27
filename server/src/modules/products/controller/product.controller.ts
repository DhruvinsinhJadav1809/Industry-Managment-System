import { successResponse } from "../../../shared/response/response.helper";
import { asyncHandler } from "../../../shared/helpers/async-handler";
import * as productService from "../services/product.service";

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user.id);

  return res
    .status(201)
    .json(successResponse(product, "Product created successfully."));
});

export const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getProducts(req.query);

  return res.json(successResponse(products));
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(String(req.params.id));

  return res.json(successResponse(product, "Product retrieved successfully."));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(String(req.params.id), req.user.id);

  return res.json(successResponse(null, "Product deleted successfully."));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(
    String(req.params.id),
    req.body,
    req.user.id,
  );

  return res.json(successResponse(product, "Product updated successfully."));
});
