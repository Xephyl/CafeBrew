import { XenditWebhookSchema } from "@shared/core"

import { processWebhookEvent, requestInvoiceForOrder, verifyWebhookToken } from "../services/payment.service.js"
import { success } from "../utils/apiResponse.js"
import { AppError } from "../utils/AppError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// POST /api/payments/invoice — requires authenticate
export const createInvoiceHandler = asyncHandler(async (req, res) => {
  const { orderId } = req.body
  if (!orderId) {
    throw new AppError(422, "VALIDATION_ERROR", "Validation failed", { orderId: "orderId is required" })
  }

  const invoiceUrl = await requestInvoiceForOrder(req.user.sub, orderId)
  res.status(200).json(success({ invoiceUrl }))
})

// Process webhook event
export const webhookHandler = asyncHandler(async (req, res) => {
  const token = req.headers["x-callback-token"]

  if (!verifyWebhookToken(token)) {
    console.warn("Webhook token verification failed — request rejected before any DB access")
    return res.status(401).json({ success: false, error: { code: "WEBHOOK_TOKEN_INVALID", message: "Invalid webhook token" } })
  }

  try {
    const payload = XenditWebhookSchema.parse(req.body)
    await processWebhookEvent(payload)
  } catch (err) {
    console.error("Webhook processing error (non-fatal, returning 200):", err.message)
  }

  res.status(200).json({ success: true })
})

