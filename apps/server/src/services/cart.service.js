import Cart from "../models/cart.model.js"

// Get or create cart for user
export async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product")

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] })
  }

  return cart
}