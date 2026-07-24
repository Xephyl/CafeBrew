import { getOrCreateCart } from "../services/cart.service.js"
import { success } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// GET /api/cart — requires authenticate, lazy-creates an empty cart on first access
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.sub)
  res.status(200).json(success({ cart }))
})