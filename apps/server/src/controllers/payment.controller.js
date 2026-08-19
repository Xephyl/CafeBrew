import { logRawWebhookPayload, requestInvoiceForOrder, verifyWebhookToken } from "../services/payment.service.js"
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

// POST /api/payments/webhook — PUBLIC, no authenticate
export const webhookHandler = asyncHandler(async (req, res) => {
  const token = req.headers["x-callback-token"]

  if (!verifyWebhookToken(token)) {
    console.warn("Webhook token verification failed — request rejected before any DB access")
    return res.status(401).json({ success: false, error: { code: "WEBHOOK_TOKEN_INVALID", message: "Invalid webhook token" } })
  }

  // Logs the raw webhook payload
  logRawWebhookPayload(req.body)

  res.status(200).json({ success: true })
})

