import { Router } from 'express'

import {
  cancelOrderHandler,
  getOrderHandler,
  listOrdersHandler,
  placeOrderHandler,
  updateOrderStatusHandler,
} from '../controllers/order.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

// Customer route
router.post('/', authenticate, placeOrderHandler)

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), listOrdersHandler)
router.get('/:id', authenticate, authorize('ADMIN'), getOrderHandler)
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateOrderStatusHandler)
router.post('/:id/cancel', authenticate, authorize('ADMIN'), cancelOrderHandler)

export default router
