import { AppError } from "../utils/AppError.js"
import { verifyAccessToken } from "../utils/token.js"

// Authenticates requests using the Authorization header
export function authenticate(req, res, next) {
  const header = req.headers.authorization

  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "TOKEN_MISSING", "Access token is missing")
  }

  const token = header.slice("Bearer ".length)

  try {
    req.user = verifyAccessToken(token)
    next()
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new AppError(401, "TOKEN_EXPIRED", "Access token has expired")
    }
    throw new AppError(401, "TOKEN_INVALID", "Access token is invalid")
  }
}