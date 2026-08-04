import { PlaceOrderSchema } from '@shared/core'

import {
  cancelOrder,
  getOrderById,
  listOrders,
  placeOrder,
  updateOrderStatus,
} from '../services/order.service.js'
import { success } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// POST /api/orders – requires authenticate
export const placeOrderHandler = asyncHandler(async (req, res) => {
  const data = PlaceOrderSchema.parse(req.body)
  const order = await placeOrder(req.user.sub, data)
  res.status(201).json(success({ order }))
})

// GET /api/orders — admin, paginated, filterable
export const listOrdersHandler = asyncHandler(async (req, res) => {
  const { status, paymentStatus, search, page, limit } = req.query
  const result = await listOrders({ status, paymentStatus, search, page, limit })
  res.status(200).json(success(result))
})

// GET /api/orders/:id — admin, full detail
export const getOrderHandler = asyncHandler(async (req, res) => {
  const order = await getOrderById(req.params.id)
  res.status(200).json(success({ order }))
})

// PATCH /api/orders/:id/status — admin
export const updateOrderStatusHandler = asyncHandler(async (req, res) => {
  const { status, note } = req.body
  const order = await updateOrderStatus(req.params.id, status, note)
  res.status(200).json(success({ order }))
})

// POST /api/orders/:id/cancel — admin, requires a reason, restores stock
export const cancelOrderHandler = asyncHandler(async (req, res) => {
  const { reason } = req.body
  if (!reason) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Validation failed', {
      reason: 'reason is required',
    })
  }
  const order = await cancelOrder(req.params.id, reason)
  res.status(200).json(success({ order }))
})
