import crypto from "node:crypto"

import jwt from "jsonwebtoken"

import { jwtConfig } from "../config/jwt.js"

export function signAccessToken(payload) {
  return jwt.sign(payload, jwtConfig.accessSecret, { expiresIn: jwtConfig.accessExpiresIn })
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, jwtConfig.accessSecret)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, jwtConfig.refreshSecret)
}

// Refresh tokens are stored server-side only as a hash, never plaintext
export function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex")
}
