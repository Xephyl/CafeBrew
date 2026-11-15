import mongoose from "mongoose"
import request from "supertest"

import Order from "../models/order.model.js"
import Product from "../models/product.model.js"
import User from "../models/user.model.js"

import {
  app,
  authHeader,
  createAdminUser,
  createProduct,
  loginUser,
  registerUser,
} from "./helpers.js"

const ADDRESS = {
  street: "123 Main St",
  city: "Manila",
  province: "Metro Manila",
  zipCode: "1000",
  isDefault: true,
}

async function setupOrderableCustomer(productOverrides = {}) {
  const reg = await registerUser()
  const token = reg.body.data.accessToken
  const user = await User.findById(reg.body.data.user._id)
  user.addresses.push(ADDRESS)
  await user.save()
  const addressId = user.addresses[0]._id.toString()

  const product = await createProduct(productOverrides)
  const variantId = product.variants[0]._id.toString()

  const add = await request(app)
    .post("/api/cart/items")
    .set(authHeader(token))
    .send({ productId: product._id.toString(), variantId, quantity: 2 })
  const cartId = add.body.data.cart._id

  return { token, user, product, variantId, addressId, cartId }
}

describe("POST /api/orders", () => {
  it("should place an order, deduct stock, and clear the cart", async () => {
    const { token, product, variantId, addressId, cartId } =
      await setupOrderableCustomer({ price: 12000 })
    const stockBefore = product.variants[0].stock

    const res = await request(app)
      .post("/api/orders")
      .set(authHeader(token))
      .send({ cartId, addressId, paymentMethod: "CASH_ON_PICKUP" })

    expect(res.status).toBe(201)
    const order = res.body.data.order
    expect(order.orderNumber).toMatch(/^ORD-\d{8}-[A-Z0-9]{5}$/)
    expect(order.status).toBe("PENDING")
    expect(order.paymentStatus).toBe("UNPAID")
    expect(order.total).toBe((product.price + product.variants[0].priceModifier) * 2)
    expect(order.subtotal).toBe(order.total)
    expect(order.items).toHaveLength(1)
    expect(order.items[0].variantId.toString()).toBe(variantId)
    expect(order.shippingAddress.street).toBe(ADDRESS.street)

    const freshProduct = await Product.findById(product._id)
    expect(freshProduct.variants[0].stock).toBe(stockBefore - 2)

    const cart = await request(app).get("/api/cart").set(authHeader(token))
    expect(cart.body.data.cart.items).toHaveLength(0)
  })

  it("should ignore a client-supplied total and recompute from live product data", async () => {
    const { token, product, addressId, cartId } = await setupOrderableCustomer({
      price: 15000,
    })

    // Stale the cart snapshot, then change the live price — the order must use live data
    await Product.findByIdAndUpdate(product._id, { price: 20000 })

    const res = await request(app)
      .post("/api/orders")
      .set(authHeader(token))
      .send({
        cartId,
        addressId,
        paymentMethod: "CASH_ON_PICKUP",
        total: 1, // must be ignored
      })

    expect(res.status).toBe(201)
    expect(res.body.data.order.total).toBe(20000 * 2)
  })

  it("should return CART_NOT_FOUND when cartId does not match the user's cart", async () => {
    const { token, addressId } = await setupOrderableCustomer()

    const res = await request(app)
      .post("/api/orders")
      .set(authHeader(token))
      .send({
        cartId: new mongoose.Types.ObjectId().toString(),
        addressId,
        paymentMethod: "CASH_ON_PICKUP",
      })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe("CART_NOT_FOUND")
  })

  it("should return ADDRESS_NOT_FOUND for an unmatched addressId", async () => {
    const { token, cartId } = await setupOrderableCustomer()

    const res = await request(app)
      .post("/api/orders")
      .set(authHeader(token))
      .send({
        cartId,
        addressId: new mongoose.Types.ObjectId().toString(),
        paymentMethod: "CASH_ON_PICKUP",
      })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe("ADDRESS_NOT_FOUND")
  })

  it("should return INSUFFICIENT_STOCK with variant details and deduct nothing", async () => {
    const { token, product, variantId, addressId } = await setupOrderableCustomer({
      variants: [{ name: "Regular", priceModifier: 0, stock: 3 }],
    })

    // qty 10 exceeds stock 3 but stays within the 1-20 schema bound
    await request(app)
      .post("/api/cart/items")
      .set(authHeader(token))
      .send({ productId: product._id.toString(), variantId, quantity: 10 })
    // merge into the same line — cart now has qty 12 > stock 3
    const cart = await request(app).get("/api/cart").set(authHeader(token))
    const cartId = cart.body.data.cart._id

    const res = await request(app)
      .post("/api/orders")
      .set(authHeader(token))
      .send({ cartId, addressId, paymentMethod: "CASH_ON_PICKUP" })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK")
    expect(res.body.error.details.available).toBe(3)

    const freshProduct = await Product.findById(product._id)
    expect(freshProduct.variants[0].stock).toBe(3)
    expect(await Order.countDocuments()).toBe(0)
  })

  it("should return PRODUCT_NOT_AVAILABLE and deduct no stock when a product went INACTIVE", async () => {
    const { token, product, addressId, cartId } = await setupOrderableCustomer()
    await Product.findByIdAndUpdate(product._id, { status: "INACTIVE" })

    const res = await request(app)
      .post("/api/orders")
      .set(authHeader(token))
      .send({ cartId, addressId, paymentMethod: "CASH_ON_PICKUP" })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe("PRODUCT_NOT_AVAILABLE")
    expect(await Order.countDocuments()).toBe(0)
  })
})

describe("admin order routes", () => {
  async function setupAdminAndOrder() {
    await createAdminUser()
    const adminLogin = await loginUser("admin@example.com")
    const adminToken = adminLogin.body.data.accessToken

    const { token, addressId, cartId } = await setupOrderableCustomer()
    const placed = await request(app)
      .post("/api/orders")
      .set(authHeader(token))
      .send({ cartId, addressId, paymentMethod: "CASH_ON_PICKUP" })
    const orderId = placed.body.data.order._id

    return { adminToken, orderId, customerToken: token }
  }

  it("should forbid non-admin access to GET /api/orders", async () => {
    const { customerToken } = await setupAdminAndOrder()

    const res = await request(app).get("/api/orders").set(authHeader(customerToken))

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe("FORBIDDEN")
  })

  it("should filter orders by status for an admin", async () => {
    const { adminToken } = await setupAdminAndOrder()

    const res = await request(app)
      .get("/api/orders?status=PENDING")
      .set(authHeader(adminToken))

    expect(res.status).toBe(200)
    expect(res.body.data.orders).toHaveLength(1)
    expect(res.body.data.orders[0].status).toBe("PENDING")
    expect(res.body.data.pagination.total).toBe(1)
  })

  it("should return ORDER_NOT_FOUND for an unknown order id", async () => {
    const { adminToken } = await setupAdminAndOrder()

    const res = await request(app)
      .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
      .set(authHeader(adminToken))

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe("ORDER_NOT_FOUND")
  })

  it("should return 422 INVALID_STATUS_TRANSITION — not 500 — for PENDING → READY", async () => {
    const { adminToken, orderId } = await setupAdminAndOrder()

    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set(authHeader(adminToken))
      .send({ status: "READY" })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe("INVALID_STATUS_TRANSITION")
  })

  it("should restore stock when an admin cancels an order", async () => {
    const { adminToken, orderId } = await setupAdminAndOrder()
    const orderBefore = await Order.findById(orderId)
    const product = await Product.findById(orderBefore.items[0].product)
    const stockAfterOrder = product.variants[0].stock

    const res = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set(authHeader(adminToken))
      .send({ reason: "Customer changed mind" })

    expect(res.status).toBe(200)
    expect(res.body.data.order.status).toBe("CANCELLED")

    const freshProduct = await Product.findById(product._id)
    expect(freshProduct.variants[0].stock).toBe(stockAfterOrder + orderBefore.items[0].quantity)
  })

  it("should reject cancelling a COMPLETED order", async () => {
    const { adminToken, orderId } = await setupAdminAndOrder()

    // Walk the order to COMPLETED: PENDING→CONFIRMED→PREPARING→READY→COMPLETED
    for (const status of ["CONFIRMED", "PREPARING", "READY", "COMPLETED"]) {
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set(authHeader(adminToken))
        .send({ status })
    }

    const res = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set(authHeader(adminToken))
      .send({ reason: "too late" })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe("ORDER_CANNOT_BE_CANCELLED")
  })

  it("should return VALIDATION_ERROR when cancel has no reason", async () => {
    const { adminToken, orderId } = await setupAdminAndOrder()

    const res = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set(authHeader(adminToken))
      .send({})

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe("VALIDATION_ERROR")
  })
})
