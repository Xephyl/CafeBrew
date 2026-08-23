import { Router } from 'express'
import multer from 'multer'

import { uploadProductImageHandler } from '../controllers/upload.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

router.post(
  '/product-image',
  authenticate,
  authorize('ADMIN'),
  upload.single('image'),
  uploadProductImageHandler
)

export default router
