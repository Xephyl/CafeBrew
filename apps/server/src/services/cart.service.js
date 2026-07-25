import Cart from "../models/cart.model.js"
import Product from "../models/product.model.js"
import { AppError } from "../utils/AppError.js"

// Get or create cart for user
export async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product")

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] })
  }

  return cart
}

// Add item to cart
export async function addItemToCart(userId, { productId, variantId, quantity }) {
  const product = await Product.findById(productId)
  if (product?.status !== "ACTIVE") {
    throw new AppError(422, "PRODUCT_NOT_AVAILABLE", "This product is not currently available")
  }

  const variant = product.variants.id(variantId)
  if (!variant) {
    throw new AppError(422, "PRODUCT_NOT_AVAILABLE", "This variant is not currently available")
  }

  const cart = await getOrCreateCart(userId)

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId && item.variantId.toString() === variantId
  )

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    const unitPrice = product.price + variant.priceModifier
    cart.items.push({ product: productId, variantId, quantity, unitPrice })
  }

  await cart.save()
  return getOrCreateCart(userId)
}

// Update cart item quantity
export async function updateCartItemQuantity(userId, itemId, quantity) {
  const cart = await Cart.findOne({ user: userId })
  if (!cart) {
    throw new AppError(404, "CART_NOT_FOUND", "Cart not found")
  }

  const item = cart.items.id(itemId)
  if (!item) {
    throw new AppError(404, "ITEM_NOT_FOUND", "Cart item not found")
  }

  item.quantity = quantity
  await cart.save()
  return getOrCreateCart(userId)
}

// Remove item from cart
export async function removeCartItem(userId, itemId) {
  const cart = await Cart.findOne({ user: userId })
  if (!cart) {
    throw new AppError(404, "CART_NOT_FOUND", "Cart not found")
  }

  const item = cart.items.id(itemId)
  if (!item) {
    throw new AppError(404, "ITEM_NOT_FOUND", "Cart item not found")
  }

  item.deleteOne()
  await cart.save()
  return getOrCreateCart(userId)
}

// Clear cart
export async function clearCart(userId) {
  const cart = await Cart.findOne({ user: userId })
  if (!cart) {
    throw new AppError(404, "CART_NOT_FOUND", "Cart not found")
  }

  cart.items = []
  await cart.save()
  return cart
}