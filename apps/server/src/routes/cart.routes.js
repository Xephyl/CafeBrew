import { Router } from "express"

import {
  addItem,
  clearCartHandler,
  getCart,
  removeItem,
  updateItem,
} from "../controllers/cart.controller.js"
import { authenticate } from "../middleware/authenticate.js"

const router = Router()

// Public routes (no authentication required)
router.get("/", authenticate, getCart)
router.post("/items", authenticate, addItem)
router.patch("/items/:itemId", authenticate, updateItem)
router.delete("/items/:itemId", authenticate, removeItem)
router.delete("/", authenticate, clearCartHandler)

export default router