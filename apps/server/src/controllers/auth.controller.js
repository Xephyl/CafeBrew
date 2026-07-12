import { LoginSchema, RegisterSchema } from "@shared/core"

import { config } from "../config/index.js"
import { issueTokenPair, loginUser, registerUser } from "../services/auth.service.js"
import { success } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const REFRESH_COOKIE_NAME = "refreshToken"
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

// Set refresh cookie helper
function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  })
}

// Register controller
export const register = asyncHandler(async (req, res) => {
  const data = RegisterSchema.parse(req.body)

  const user = await registerUser(data)
  const { accessToken, refreshToken } = await issueTokenPair(user)

  setRefreshCookie(res, refreshToken)
  res.status(201).json(success({ user: user.toSafeObject(), accessToken }))
})

// Login controller
export const login = asyncHandler(async (req, res) => {
  const data = LoginSchema.parse(req.body)

  const user = await loginUser(data)
  const { accessToken, refreshToken } = await issueTokenPair(user)

  setRefreshCookie(res, refreshToken)
  res.status(200).json(success({ user: user.toSafeObject(), accessToken }))
})