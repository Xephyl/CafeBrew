// Product and ProductVariant shape references.

/**
 * @typedef {Object} ProductVariant
 * @property {string} name - e.g. "Small", "Large"
 * @property {number} priceModifier - integer, PHP centavos, added to base price
 * @property {number} stock
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} slug - unique
 * @property {string} description
 * @property {number} price - integer, PHP centavos
 * @property {string} category - Category id (ref)
 * @property {ProductVariant[]} variants
 * @property {string[]} imageUrls
 * @property {"ACTIVE"|"INACTIVE"} status - see ProductStatus enum
 * @property {string} createdAt - ISO 8601
 * @property {string} updatedAt - ISO 8601
 */

export {}