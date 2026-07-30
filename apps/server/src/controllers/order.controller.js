import { PlaceOrderSchema } from "@shared/core"

import { placeOrder } from "../services/order.service.js"
import { success } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// POST /api/orders – requires authenticate
export const placeOrderHandler = asyncHandler(async (req, res) => {
  const data = PlaceOrderSchema.parse(req.body)
  const order = await placeOrder(req.user.sub, data)
  res.status(201).json(success({ order }))
})