// Order and OrderItem shape references.
// OrderItem is a purchase-time snapshot, distinct from CartItem's live price ref.

/**
 * @typedef {Object} OrderItem
 * @property {string} product - Product id at time of purchase
 * @property {string} variantId
 * @property {string} name - snapshot, product name at time of purchase
 * @property {number} quantity
 * @property {number} unitPrice - snapshot, integer PHP centavos at time of purchase
 */

/**
 * @typedef {Object} OrderStatusHistoryEntry
 * @property {string} status
 * @property {string} timestamp - ISO 8601
 * @property {string} [note]
 */

/**
 * @typedef {Object} OrderPayment
 * @property {string} provider - e.g. "xendit"
 * @property {string} [invoiceId]
 * @property {string} status
 * @property {string} [paidAt] - ISO 8601
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} orderNumber - unique, format ORD-YYYYMMDD-XXXXX
 * @property {string} user - User id (ref)
 * @property {OrderItem[]} items - embedded snapshot
 * @property {"PENDING"|"CONFIRMED"|"PREPARING"|"READY"|"COMPLETED"|"CANCELLED"} status - see OrderStatus enum
 * @property {OrderStatusHistoryEntry[]} statusHistory
 * @property {Address} shippingAddress - embedded snapshot
 * @property {"XENDIT_INVOICE"|"CASH_ON_PICKUP"} paymentMethod - see PaymentMethod enum
 * @property {"UNPAID"|"PAID"|"FAILED"} paymentStatus - see PaymentStatus enum
 * @property {OrderPayment} payment
 * @property {number} subtotal - integer, PHP centavos
 * @property {number} total - integer, PHP centavos
 * @property {string} createdAt - ISO 8601
 * @property {string} updatedAt - ISO 8601
 */

export {}