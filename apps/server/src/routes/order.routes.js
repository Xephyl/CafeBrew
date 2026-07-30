import { Router } from "express"

import { placeOrderHandler } from "../controllers/order.controller.js"
import { authenticate } from "../middleware/authenticate.js"

const router = Router()

router.post("/", authenticate, placeOrderHandler)

export default router