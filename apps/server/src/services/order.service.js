import Cart from '../models/cart.model.js'
import Order from '../models/order.model.js'
import Product from '../models/product.model.js'
import User from '../models/user.model.js'
import { AppError } from '../utils/AppError.js'

import { clearCart } from './cart.service.js'

// Places an order from the requester's own cart
export async function placeOrder(userId, { cartId, addressId, paymentMethod }) {
  // 1. Get user's cart
  const cart = await Cart.findOne({ user: userId })
  if (!cart || cart._id.toString() !== cartId) {
    throw new AppError(404, 'CART_NOT_FOUND', 'Cart not found')
  }

  if (cart.items.length === 0) {
    throw new AppError(422, 'CART_EMPTY', 'Your cart is empty')
  }

  // 2. Get user's address
  const user = await User.findById(userId)
  const address = user.addresses.id(addressId)
  if (!address) {
    throw new AppError(404, 'ADDRESS_NOT_FOUND', 'Shipping address not found')
  }

  // 3. Get all products
  const productDocs = new Map()
  for (const cartItem of cart.items) {
    const productId = cartItem.product.toString()
    if (!productDocs.has(productId)) {
      const product = await Product.findById(productId)
      if (product?.status !== 'ACTIVE') {
        throw new AppError(
          422,
          'PRODUCT_NOT_AVAILABLE',
          'A product in your cart is no longer available'
        )
      }
      productDocs.set(productId, product)
    }
  }

  // 4. Build order items and validate stock
  const orderItems = []
  let subtotal = 0

  for (const cartItem of cart.items) {
    const product = productDocs.get(cartItem.product.toString())
    const variant = product.variants.id(cartItem.variantId)
    if (!variant) {
      throw new AppError(
        422,
        'PRODUCT_NOT_AVAILABLE',
        'A variant in your cart is no longer available'
      )
    }

    if (variant.stock < cartItem.quantity) {
      throw new AppError(422, 'INSUFFICIENT_STOCK', 'Not enough stock for this item', {
        variantId: variant._id.toString(),
        available: variant.stock,
      })
    }

    // Calculate unit price from live product data
    const unitPrice = product.price + variant.priceModifier
    orderItems.push({
      product: product._id,
      name: product.name,
      variantId: variant._id,
      variantName: variant.name,
      quantity: cartItem.quantity,
      unitPrice,
    })
    subtotal += unitPrice * cartItem.quantity
  }

  // 5. Deduct stock
  for (const item of orderItems) {
    const product = productDocs.get(item.product.toString())
    const variant = product.variants.id(item.variantId)
    variant.stock -= item.quantity
  }
  await Promise.all([...productDocs.values()].map((p) => p.save()))

  // 6. Create the order
  const total = subtotal // no shipping/tax logic yet

  const order = new Order({
    user: userId,
    items: orderItems,
    shippingAddress: {
      street: address.street,
      city: address.city,
      province: address.province,
      zipCode: address.zipCode,
    },
    paymentMethod,
    paymentStatus: 'UNPAID',
    subtotal,
    total,
  })

  // 7. Add initial status history
  order.statusHistory.push({ status: 'PENDING', timestamp: new Date(), note: 'Order placed' })

  await order.save()

  // 8. Clear the cart
  await clearCart(userId)

  return order
}

// List orders with pagination and filtering
export async function listOrders({ status, paymentStatus, search, page = 1, limit = 20 }) {
  const query = {}
  if (status) query.status = status
  if (paymentStatus) query.paymentStatus = paymentStatus
  if (search) query.orderNumber = { $regex: search, $options: 'i' }

  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1)
  const limitNum = Math.max(1, Number.parseInt(limit, 10) || 20)
  const skip = (pageNum - 1) * limitNum

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Order.countDocuments(query),
  ])

  return {
    orders,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  }
}

// Get order by ID
export async function getOrderById(orderId) {
  const order = await Order.findById(orderId)
  if (!order) {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')
  }
  return order
}

// Update order status
export async function updateOrderStatus(orderId, newStatus, note) {
  const order = await Order.findById(orderId)
  if (!order) {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')
  }

  try {
    order.transitionStatus(newStatus, note)
  } catch (err) {
    throw new AppError(
      err.statusCode || 422,
      err.code || 'INVALID_STATUS_TRANSITION',
      err.message,
      err.details
    )
  }

  await order.save()
  return order
}

// Cancel order
export async function cancelOrder(orderId, reason) {
  const order = await Order.findById(orderId)
  if (!order) {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found')
  }

  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new AppError(
      422,
      'ORDER_CANNOT_BE_CANCELLED',
      'Only pending or confirmed orders can be cancelled'
    )
  }

  // Restore stock for every item
  const productDocs = new Map()
  for (const item of order.items) {
    const productId = item.product.toString()
    if (!productDocs.has(productId)) {
      const product = await Product.findById(productId)
      if (product) productDocs.set(productId, product)
    }
    const product = productDocs.get(productId)
    if (product) {
      const variant = product.variants.id(item.variantId)
      if (variant) variant.stock += item.quantity
    }
  }
  await Promise.all([...productDocs.values()].map((p) => p.save()))

  try {
    order.transitionStatus('CANCELLED', reason)
  } catch (err) {
    throw new AppError(
      err.statusCode || 422,
      err.code || 'INVALID_STATUS_TRANSITION',
      err.message,
      err.details
    )
  }

  await order.save()
  return order
}
