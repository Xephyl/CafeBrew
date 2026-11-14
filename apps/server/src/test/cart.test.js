import request from "supertest"

import Product from "../models/product.model.js"
import {
  app,
  authHeader,
  createProduct,
  registerUser,
} from "./helpers.js"

async function setupCustomerWithProduct(productOverrides = {}) {
  const reg = await registerUser()
  const token = reg.body.data.accessToken
  const userId = reg.body.data.user._id
  const product = await createProduct(productOverrides)
  const variantId = product.variants[0]._id.toString()
  return { token, userId, product, variantId }
}

describe("GET /api/cart", () => {
  it("should lazily create and return an empty cart for a new user", async () => {
    const { token, userId } = await setupCustomerWithProduct()

    const res = await request(app).get("/api/cart").set(authHeader(token))

    expect(res.status).toBe(200)
    expect(res.body.data.cart.user.toString()).toBe(userId)
    expect(res.body.data.cart.items).toHaveLength(0)
  })

  it("should return TOKEN_MISSING without authentication", async () => {
    const res = await request(app).get("/api/cart")

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe("TOKEN_MISSING")
  })
})

describe("POST /api/cart/items", () => {
  it("should add an item to the cart", async () => {
    const { token, product, variantId } = await setupCustomerWithProduct()

    const res = await request(app)
      .post("/api/cart/items")
      .set(authHeader(token))
      .send({ productId: product._id.toString(), variantId, quantity: 2 })

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items).toHaveLength(1)
    expect(res.body.data.cart.items[0].quantity).toBe(2)
    expect(res.body.data.cart.items[0].unitPrice).toBe(product.price)
  })

  it("should increment quantity on duplicate product+variant instead of duplicating the line", async () => {
    const { token, product, variantId } = await setupCustomerWithProduct()
    const payload = { productId: product._id.toString(), variantId, quantity: 2 }

    await request(app).post("/api/cart/items").set(authHeader(token)).send(payload)
    const res = await request(app).post("/api/cart/items").set(authHeader(token)).send({ ...payload, quantity: 3 })

    expect(res.body.data.cart.items).toHaveLength(1)
    expect(res.body.data.cart.items[0].quantity).toBe(5)
  })

  it("should return PRODUCT_NOT_AVAILABLE for an INACTIVE product", async () => {
    const { token, product, variantId } = await setupCustomerWithProduct()
    await Product.findByIdAndUpdate(product._id, { status: "INACTIVE" })

    const res = await request(app)
      .post("/api/cart/items")
      .set(authHeader(token))
      .send({ productId: product._id.toString(), variantId, quantity: 1 })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe("PRODUCT_NOT_AVAILABLE")
  })

  it("should return VALIDATION_ERROR for quantity 0 and 21", async () => {
    const { token, product, variantId } = await setupCustomerWithProduct()

    for (const quantity of [0, 21]) {
      const res = await request(app)
        .post("/api/cart/items")
        .set(authHeader(token))
        .send({ productId: product._id.toString(), variantId, quantity })
      expect(res.status).toBe(422)
      expect(res.body.error.code).toBe("VALIDATION_ERROR")
    }
  })
})

describe("PATCH /api/cart/items/:itemId", () => {
  it("should update the item quantity", async () => {
    const { token, product, variantId } = await setupCustomerWithProduct()
    const add = await request(app)
      .post("/api/cart/items")
      .set(authHeader(token))
      .send({ productId: product._id.toString(), variantId, quantity: 2 })
    const itemId = add.body.data.cart.items[0]._id

    const res = await request(app)
      .patch(`/api/cart/items/${itemId}`)
      .set(authHeader(token))
      .send({ quantity: 7 })

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items[0].quantity).toBe(7)
  })

  it("should reject quantity 0 and 21 without mutating the item", async () => {
    const { token, product, variantId } = await setupCustomerWithProduct()
    const add = await request(app)
      .post("/api/cart/items")
      .set(authHeader(token))
      .send({ productId: product._id.toString(), variantId, quantity: 4 })
    const itemId = add.body.data.cart.items[0]._id

    for (const quantity of [0, 21]) {
      const res = await request(app)
        .patch(`/api/cart/items/${itemId}`)
        .set(authHeader(token))
        .send({ quantity })
      expect(res.status).toBe(422)
      expect(res.body.error.code).toBe("VALIDATION_ERROR")
    }

    const cart = await request(app).get("/api/cart").set(authHeader(token))
    expect(cart.body.data.cart.items[0].quantity).toBe(4)
  })

  it("should return ITEM_NOT_FOUND for an unknown item", async () => {
    const { token } = await setupCustomerWithProduct()
    await request(app).get("/api/cart").set(authHeader(token)) // ensure cart exists

    const res = await request(app)
      .patch("/api/cart/items/000000000000000000000000")
      .set(authHeader(token))
      .send({ quantity: 1 })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe("ITEM_NOT_FOUND")
  })
})

describe("DELETE /api/cart/items/:itemId and DELETE /api/cart", () => {
  it("should remove a single item", async () => {
    const { token, product, variantId } = await setupCustomerWithProduct()
    await request(app)
      .post("/api/cart/items")
      .set(authHeader(token))
      .send({ productId: product._id.toString(), variantId, quantity: 1 })
    const cart = await request(app).get("/api/cart").set(authHeader(token))
    const itemId = cart.body.data.cart.items[0]._id

    const res = await request(app)
      .delete(`/api/cart/items/${itemId}`)
      .set(authHeader(token))

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items).toHaveLength(0)
  })

  it("should clear all items", async () => {
    const { token, product, variantId } = await setupCustomerWithProduct()
    await request(app)
      .post("/api/cart/items")
      .set(authHeader(token))
      .send({ productId: product._id.toString(), variantId, quantity: 3 })

    const res = await request(app).delete("/api/cart").set(authHeader(token))

    expect(res.status).toBe(200)
    expect(res.body.data.cart.items).toHaveLength(0)
  })
})

describe("totalAmount virtual", () => {
  it("should reflect the correct sum after add and update", async () => {
    const { token, product, variantId } = await setupCustomerWithProduct()
    await request(app)
      .post("/api/cart/items")
      .set(authHeader(token))
      .send({ productId: product._id.toString(), variantId, quantity: 2 })

    const cart = await request(app).get("/api/cart").set(authHeader(token))
    expect(cart.body.data.cart.totalAmount).toBe(product.price * 2)
  })
})
