import { Router } from 'express'

import {
  createProductHandler,
  deleteProductHandler,
  getProductBySlug,
  listProducts,
  updateProductHandler,
} from '../controllers/product.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

// Public routes (no authentication required)
router.get('/', listProducts)
router.get('/:slug', getProductBySlug)

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), createProductHandler)
router.put('/:id', authenticate, authorize('ADMIN'), updateProductHandler)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProductHandler)

export default router
