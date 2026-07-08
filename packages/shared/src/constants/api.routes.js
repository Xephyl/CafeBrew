// Single source of truth for every backend endpoint path.
const authBase = '/api/auth'
const usersBase = '/api/users'
const productsBase = '/api/products'
const categoriesBase = '/api/categories'
const cartBase = '/api/cart'
const ordersBase = '/api/orders'
const paymentsBase = '/api/payments'
const uploadBase = '/api/upload'

export const API_ROUTES = {
  AUTH: {
    REGISTER: `${authBase}/register`,
    LOGIN: `${authBase}/login`,
    REFRESH: `${authBase}/refresh`,
    LOGOUT: `${authBase}/logout`,
    ME: `${authBase}/me`,
  },

  USERS: {
    PROFILE: `${usersBase}/profile`,
    ADDRESSES: `${usersBase}/addresses`,
  },

  PRODUCTS: {
    LIST: productsBase,
    DETAIL: `${productsBase}/:slug`,
    ADMIN_CREATE: productsBase,
    ADMIN_UPDATE: `${productsBase}/:id`,
    ADMIN_DELETE: `${productsBase}/:id`,
  },

  CATEGORIES: {
    TREE: categoriesBase,
    BY_SLUG: `${categoriesBase}/:slug`,
    ADMIN_CREATE: categoriesBase,
    ADMIN_UPDATE: `${categoriesBase}/:id`,
    ADMIN_DELETE: `${categoriesBase}/:id`,
  },

  CART: {
    GET: cartBase,
    ADD_ITEM: `${cartBase}/items`,
    UPDATE_ITEM: `${cartBase}/items/:itemId`,
    REMOVE_ITEM: `${cartBase}/items/:itemId`,
    CLEAR: cartBase,
  },

  ORDERS: {
    PLACE: ordersBase,
    MY_ORDERS: `${ordersBase}/my`,
    DETAIL: `${ordersBase}/:id`,
    CANCEL: `${ordersBase}/:id/cancel`,
    ADMIN_LIST: ordersBase,
    UPDATE_STATUS: `${ordersBase}/:id/status`,
  },

  PAYMENTS: {
    CREATE_INVOICE: `${paymentsBase}/invoice`,
    WEBHOOK: `${paymentsBase}/webhook`,
  },

  UPLOAD: {
    PRODUCT_IMAGE: `${uploadBase}/product-image`,
  },
}
