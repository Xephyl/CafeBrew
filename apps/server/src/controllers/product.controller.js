import { CreateProductSchema, UpdateProductSchema } from "@shared/core"

import { createProduct, deleteProduct, updateProduct } from "../services/product.service.js"
import { success } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// POST /api/products – admin
export const createProductHandler = asyncHandler(async (req, res) => {
  const data = CreateProductSchema.parse(req.body)
  const product = await createProduct(data)
  res.status(201).json(success({ product }))
})

// PUT /api/products/:id – admin
export const updateProductHandler = asyncHandler(async (req, res) => {
  const data = UpdateProductSchema.parse(req.body)
  const product = await updateProduct(req.params.id, data)
  res.status(200).json(success({ product }))
})

// DELETE /api/products/:id – admin, soft delete only
export const deleteProductHandler = asyncHandler(async (req, res) => {
  const product = await deleteProduct(req.params.id)
  res.status(200).json(success({ product }))
})