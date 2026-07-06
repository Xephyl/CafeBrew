// User and Address shape references.
// All IDs are strings (serialized MongoDB ObjectId). All dates are ISO 8601 strings.

/**
 * @typedef {Object} Address
 * @property {string} street
 * @property {string} city
 * @property {string} province
 * @property {string} zipCode
 * @property {boolean} isDefault
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {"CUSTOMER"|"ADMIN"} role - see UserRole enum
 * @property {boolean} isActive
 * @property {Address[]} addresses - editable, referenced list
 * @property {string} createdAt - ISO 8601
 * @property {string} updatedAt - ISO 8601
 */

export {}
