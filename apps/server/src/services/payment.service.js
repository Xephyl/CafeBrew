import { config } from "../config/index.js"
import Order from "../models/order.model.js"
import { AppError } from "../utils/AppError.js"

const XENDIT_API_BASE = "https://api.xendit.co"

// Builds the Basic Auth header for Xendit API
function buildAuthHeader() {
  const credentials = `${config.XENDIT_SECRET_KEY}:`
  return `Basic ${Buffer.from(credentials).toString("base64")}`
}

// Creates an invoice with Xendit
export async function createInvoice(order) {
  let response
  try {
    response = await fetch(`${XENDIT_API_BASE}/v2/invoices`, {
      method: "POST",
      headers: {
        Authorization: buildAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: order.orderNumber,
        amount: order.total,
        currency: "PHP",
        description: `Payment for order ${order.orderNumber}`,
      }),
    })
  } catch (err) {
    throw new AppError(502, "PAYMENT_PROVIDER_ERROR", "Unable to reach the payment provider")
  }

  if (!response.ok) {
    throw new AppError(502, "PAYMENT_PROVIDER_ERROR", "Payment provider returned an error")
  }

  const data = await response.json()

  return {
    invoiceId: data.id,
    invoiceUrl: data.invoice_url,
  }
}

// Requests an invoice for an order
export async function requestInvoiceForOrder(userId, orderId) {
  const order = await Order.findById(orderId)
  if (!order) {
    throw new AppError(404, "ORDER_NOT_FOUND", "Order not found")
  }

  if (order.user.toString() !== userId) {
    throw new AppError(403, "FORBIDDEN", "You do not have permission to access this order")
  }

  if (order.paymentStatus !== "UNPAID") {
    throw new AppError(409, "PAYMENT_ALREADY_PROCESSED", "This order has already been paid or processed")
  }

  const { invoiceId, invoiceUrl } = await createInvoice(order)

  order.payment.provider = "XENDIT"
  order.payment.invoiceId = invoiceId
  order.payment.invoiceUrl = invoiceUrl
  order.payment.status = "PENDING"
  await order.save()

  return invoiceUrl
}