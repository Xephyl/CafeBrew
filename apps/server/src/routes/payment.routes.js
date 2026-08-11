import { Router } from "express"

import { createInvoiceHandler } from "../controllers/payment.controller.js"
import { authenticate } from "../middleware/authenticate.js"

const router = Router()

// Webhook route (public, no authenticate) is added in Task 1-10.
router.post("/invoice", authenticate, createInvoiceHandler)

export default router