import User from '../models/user.model.js'
import { AppError } from '../utils/AppError.js'
import { hashRefreshToken, signAccessToken, signRefreshToken } from '../utils/token.js'

export async function registerUser({ email, password, firstName, lastName }) {
  const normalizedEmail = email.toLowerCase().trim()

  // Explicit pre-check for duplicate email
  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists')
  }

  const user = new User({ email: normalizedEmail, password, firstName, lastName })
  await user.save()
  return user
}

export async function loginUser({ email, password }) {
  const user = await User.findByEmail(email)
  if (!user?.isActive) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
  }

  return user
}

export async function issueTokenPair(user) {
  const payload = { sub: user._id.toString(), email: user.email, role: user.role }

  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  user.refreshTokenHash = hashRefreshToken(refreshToken)
  await user.save()

  return { accessToken, refreshToken }
}
