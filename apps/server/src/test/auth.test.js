import jwt from "jsonwebtoken"
import request from "supertest"

import { jwtConfig } from "../config/jwt.js"

import {
  app,
  authHeader,
  loginUser,
  registerUser,
} from "./helpers.js"

describe("POST /api/auth/register", () => {
  it("should register a user and return user + accessToken", async () => {
    const res = await registerUser()

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toEqual(expect.any(String))
    expect(res.body.data.user.email).toBe("user@example.com")
    expect(res.body.data.user.password).toBeUndefined()
    expect(res.body.data.user.refreshTokenHash).toBeUndefined()
  })

  it("should set an httpOnly refresh cookie", async () => {
    const res = await registerUser()

    const setCookie = res.headers["set-cookie"]
    expect(setCookie).toBeDefined()
    expect(setCookie.join(";")).toContain("refreshToken=")
    expect(setCookie.join(";").toLowerCase()).toContain("httponly")
  })

  it("should return EMAIL_ALREADY_EXISTS for a duplicate email", async () => {
    await registerUser()
    const res = await registerUser()

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe("EMAIL_ALREADY_EXISTS")
  })

  it("should return VALIDATION_ERROR for a weak password", async () => {
    const res = await registerUser({ password: "weak" })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe("VALIDATION_ERROR")
    expect(res.body.error.details.password).toBeDefined()
  })
})

describe("POST /api/auth/login", () => {
  it("should login with valid credentials", async () => {
    await registerUser()
    const res = await loginUser("user@example.com")

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toEqual(expect.any(String))
    expect(res.body.data.user.email).toBe("user@example.com")
  })

  it("should return INVALID_CREDENTIALS for a wrong password", async () => {
    await registerUser()
    const res = await loginUser("user@example.com", "WrongPass1")

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS")
  })

  it("should return INVALID_CREDENTIALS for an unknown email", async () => {
    const res = await loginUser("nobody@example.com")

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS")
  })
})

describe("authenticate middleware", () => {
  it("should return TOKEN_MISSING when no Authorization header is sent", async () => {
    const res = await request(app).get("/api/auth/me")

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe("TOKEN_MISSING")
  })

  it("should return TOKEN_INVALID for a malformed token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token")

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe("TOKEN_INVALID")
  })

  it("should return TOKEN_EXPIRED for an expired access token", async () => {
    const token = jwt.sign(
      { sub: "000000000000000000000000", email: "x@example.com", role: "CUSTOMER" },
      jwtConfig.accessSecret,
      { expiresIn: "-1s" }
    )

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe("TOKEN_EXPIRED")
  })

  it("should return the user for GET /api/auth/me with a valid token", async () => {
    const reg = await registerUser()
    const res = await request(app)
      .get("/api/auth/me")
      .set(authHeader(reg.body.data.accessToken))

    expect(res.status).toBe(200)
    expect(res.body.data.user.email).toBe("user@example.com")
  })
})
