import { OrderStatus, PaymentMethod, PaymentStatus, generateOrderNumber } from '@shared/core'
import mongoose from 'mongoose'

// Status transition rules - single source of truth
const ALLOWED_TRANSITIONS = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.COMPLETED],
}

// Order item schema - captures product details at time of purchase
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    variantName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
    unitPrice: { type: Number, required: true, min: 0, validate: Number.isInteger },
  },
  { _id: false }
)

// Shipping address schema - captures address at time of purchase
const shippingAddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(OrderStatus), required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    note: { type: String },
  },
  { _id: false }
)

const paymentSchema = new mongoose.Schema(
  {
    provider: { type: String },
    invoiceId: { type: String },
    status: { type: String },
    paidAt: { type: Date },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    statusHistory: { type: [statusHistoryEntrySchema], default: [] },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
    },
    payment: { type: paymentSchema, default: () => ({}) },
    subtotal: { type: Number, required: true, min: 0, validate: Number.isInteger },
    total: { type: Number, required: true, min: 0, validate: Number.isInteger },
  },
  { timestamps: true }
)

// Generate orderNumber once, on first creation only
orderSchema.pre('save', function generateOrderNum() {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = generateOrderNumber()
  }
})

// Transition status method
orderSchema.methods.transitionStatus = function transitionStatus(newStatus, note) {
  const allowed = ALLOWED_TRANSITIONS[this.status] || []

  if (!allowed.includes(newStatus)) {
    const err = new Error(`Cannot transition order from ${this.status} to ${newStatus}`)
    err.statusCode = 422
    err.code = 'INVALID_STATUS_TRANSITION'
    err.details = { from: this.status, to: newStatus }
    throw err
  }

  this.status = newStatus
  this.statusHistory.push({ status: newStatus, timestamp: new Date(), note })

  return this
}

const Order = mongoose.model('Order', orderSchema)
export default Order
