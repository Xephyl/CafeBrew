import { Router } from "express"

import { createInvoiceHandler, webhookHandler } from "../controllers/payment.controller.js"
import { authenticate } from "../middleware/authenticate.js"

const router = Router()

// Create invoice (requires authentication)
router.post("/invoice", authenticate, createInvoiceHandler)

// Webhook (no authentication required)
router.post("/webhook", webhookHandler)

export default router