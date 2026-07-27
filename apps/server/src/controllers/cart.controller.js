import { AddToCartSchema } from "@shared/core"
import { z } from "zod"

import {
  addItemToCart,
  clearCart,
  getOrCreateCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../services/cart.service.js"
import { success } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const CartItemQuantitySchema = z.object({
  quantity: AddToCartSchema.shape.quantity,
})

// GET /api/cart — requires authenticate, lazy-creates an empty cart on first access
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.sub)
  res.status(200).json(success({ cart }))
})

// POST /api/cart/items — add item, increments quantity on duplicate product+variant
export const addItem = asyncHandler(async (req, res) => {
  const data = AddToCartSchema.parse(req.body)
  const cart = await addItemToCart(req.user.sub, data)
  res.status(200).json(success({ cart }))
})

// PATCH /api/cart/items/:itemId — update quantity
export const updateItem = asyncHandler(async (req, res) => {
  const { quantity } = CartItemQuantitySchema.parse(req.body)
  const cart = await updateCartItemQuantity(req.user.sub, req.params.itemId, quantity)
  res.status(200).json(success({ cart }))
})

// DELETE /api/cart/items/:itemId — remove a single item
export const removeItem = asyncHandler(async (req, res) => {
  const cart = await removeCartItem(req.user.sub, req.params.itemId)
  res.status(200).json(success({ cart }))
})

// DELETE /api/cart — clear all items
export const clearCartHandler = asyncHandler(async (req, res) => {
  const cart = await clearCart(req.user.sub)
  res.status(200).json(success({ cart }))
})