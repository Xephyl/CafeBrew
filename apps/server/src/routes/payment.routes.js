import { Router } from "express"

import { createInvoiceHandler, webhookHandler } from "../controllers/payment.controller.js"
import { authenticate } from "../middleware/authenticate.js"

const router = Router()

// Create invoice (requires authentication)
router.post("/invoice", authenticate, createInvoiceHandler)

// Public (no authenticate. Token verified inside the handler itself)
router.post("/webhook", webhookHandler)

export default router