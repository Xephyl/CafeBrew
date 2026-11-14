import request from "supertest"

import { createApp } from "../app.js"
import Category from "../models/category.model.js"
import Product from "../models/product.model.js"
import User from "../models/user.model.js"

export const app = createApp()

export const TEST_PASSWORD = "Password1"

export async function registerUser(overrides = {}) {
  const payload = {
    email: "user@example.com",
    password: TEST_PASSWORD,
    firstName: "Test",
    lastName: "User",
    ...overrides,
  }
  const res = await request(app).post("/api/auth/register").send(payload)
  return res
}

export async function loginUser(email, password = TEST_PASSWORD) {
  return request(app).post("/api/auth/login").send({ email, password })
}

export function authHeader(accessToken) {
  return { Authorization: `Bearer ${accessToken}` }
}

export async function createCategory(overrides = {}) {
  return Category.create({ name: "Hot Drinks", ...overrides })
}

export async function createProduct(overrides = {}) {
  const { category, ...rest } = overrides
  const categoryDoc = category || (await createCategory())
  const categoryId = categoryDoc._id || categoryDoc
  return Product.create({
    name: "Iced Latte",
    description: "Espresso over ice with milk",
    price: 10000,
    variants: [{ name: "Regular", priceModifier: 0, stock: 50 }],
    status: "ACTIVE",
    ...rest,
    category: categoryId,
  })
}

export async function createAdminUser(overrides = {}) {
  return User.create({
    email: "admin@example.com",
    password: TEST_PASSWORD,
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
    ...overrides,
  })
}
