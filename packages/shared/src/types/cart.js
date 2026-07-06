// Cart and CartItem shape references.
// CartItem holds a live product reference plus a price snapshot from add-time;
// it is distinct from OrderItem, which is a full purchase-time snapshot.

/**
 * @typedef {Object} CartItem
 * @property {string} product - Product id (ref, live pricing/availability)
 * @property {string} variantId
 * @property {number} quantity
 * @property {number} unitPrice - snapshot at add-time, integer PHP centavos
 */

/**
 * @typedef {Object} Cart
 * @property {string} id
 * @property {string} user - User id (ref, unique - one active cart per user)
 * @property {CartItem[]} items
 * @property {number} totalAmount - derived/virtual, integer PHP centavos
 * @property {string} createdAt - ISO 8601
 * @property {string} updatedAt - ISO 8601
 */

export {}