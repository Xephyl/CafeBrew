import mongoose from "mongoose"
import request from "supertest"

import Order from "../models/order.model.js"
import { app } from "./helpers.js"

const VALID_TOKEN = "test-callback-token"

async function createUnpaidOrder(invoiceId = "inv_test_1") {
  return Order.create({
    user: new mongoose.Types.ObjectId(),
    items: [
      {
        product: new mongoose.Types.ObjectId(),
        name: "Iced Latte",
        variantId: new mongoose.Types.ObjectId(),
        variantName: "Regular",
        quantity: 1,
        unitPrice: 10000,
      },
    ],
    shippingAddress: {
      street: "123 Main St",
      city: "Manila",
      province: "Metro Manila",
      zipCode: "1000",
    },
    paymentMethod: "XENDIT_INVOICE",
    paymentStatus: "UNPAID",
    payment: { provider: "XENDIT", invoiceId, status: "PENDING" },
    subtotal: 10000,
    total: 10000,
  })
}

function paidPayload(invoiceId, orderNumber) {
  return {
    id: invoiceId,
    external_id: orderNumber,
    status: "PAID",
    amount: 10000,
    paid_at: new Date().toISOString(),
  }
}

describe("POST /api/payments/webhook", () => {
  it("should return 401 WEBHOOK_TOKEN_INVALID for a wrong x-callback-token and write nothing", async () => {
    const order = await createUnpaidOrder()

    const res = await request(app)
      .post("/api/payments/webhook")
      .set("x-callback-token", "wrong-token")
      .send(paidPayload(order.payment.invoiceId, order.orderNumber))

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe("WEBHOOK_TOKEN_INVALID")

    const fresh = await Order.findById(order._id)
    expect(fresh.paymentStatus).toBe("UNPAID")
    expect(fresh.status).toBe("PENDING")
  })

  it("should return 401 when the x-callback-token header is missing", async () => {
    const order = await createUnpaidOrder()

    const res = await request(app)
      .post("/api/payments/webhook")
      .send(paidPayload(order.payment.invoiceId, order.orderNumber))

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe("WEBHOOK_TOKEN_INVALID")
  })

  it("should mark the order PAID and transition to CONFIRMED on a valid PAID event", async () => {
    const order = await createUnpaidOrder()

    const res = await request(app)
      .post("/api/payments/webhook")
      .set("x-callback-token", VALID_TOKEN)
      .send(paidPayload(order.payment.invoiceId, order.orderNumber))

    expect(res.status).toBe(200)

    const fresh = await Order.findById(order._id)
    expect(fresh.paymentStatus).toBe("PAID")
    expect(fresh.payment.status).toBe("PAID")
    expect(fresh.payment.paidAt).toBeDefined()
    expect(fresh.status).toBe("CONFIRMED")
    expect(fresh.statusHistory.map((h) => h.status)).toContain("CONFIRMED")
  })

  it("should be idempotent when the same invoiceId is processed twice", async () => {
    const order = await createUnpaidOrder()
    const payload = paidPayload(order.payment.invoiceId, order.orderNumber)

    await request(app)
      .post("/api/payments/webhook")
      .set("x-callback-token", VALID_TOKEN)
      .send(payload)
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("x-callback-token", VALID_TOKEN)
      .send(payload)

    expect(res.status).toBe(200)

    const fresh = await Order.findById(order._id)
    expect(fresh.paymentStatus).toBe("PAID")
    expect(fresh.status).toBe("CONFIRMED")
    // statusHistory should contain exactly one CONFIRMED entry
    expect(fresh.statusHistory.filter((h) => h.status === "CONFIRMED")).toHaveLength(1)
  })

  it("should set paymentStatus FAILED but keep status PENDING on EXPIRED", async () => {
    const order = await createUnpaidOrder("inv_expired_1")

    const res = await request(app)
      .post("/api/payments/webhook")
      .set("x-callback-token", VALID_TOKEN)
      .send({
        id: "inv_expired_1",
        external_id: order.orderNumber,
        status: "EXPIRED",
        amount: 10000,
      })

    expect(res.status).toBe(200)

    const fresh = await Order.findById(order._id)
    expect(fresh.paymentStatus).toBe("FAILED")
    expect(fresh.payment.status).toBe("EXPIRED")
    expect(fresh.status).toBe("PENDING")
  })

  it("should return 200 for an unknown invoiceId (logged, no crash)", async () => {
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("x-callback-token", VALID_TOKEN)
      .send({
        id: "inv_unknown",
        external_id: "ORD-00000000-XXXXX",
        status: "PAID",
        amount: 10000,
      })

    expect(res.status).toBe(200)
  })
})
