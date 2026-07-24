import { Router } from "express"

import { getCart } from "../controllers/cart.controller.js"
import { authenticate } from "../middleware/authenticate.js"

const router = Router()

router.get("/", authenticate, getCart)

export default router