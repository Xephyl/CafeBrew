// Frozen enums: runtime read-only constants. JSDoc provides type hints.

export const OrderStatus = Object.freeze({
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
})

export const UserRole = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
})

export const PaymentStatus = Object.freeze({
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  FAILED: 'FAILED',
})

export const ProductStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
})

export const PaymentMethod = Object.freeze({
  XENDIT_INVOICE: 'XENDIT_INVOICE',
  CASH_ON_PICKUP: 'CASH_ON_PICKUP',
  
})
