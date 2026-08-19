import { Router } from "express"

import { login, logout, me, refresh, register } from "../controllers/auth.controller.js"
import { authenticate } from "../middleware/authenticate.js"

const router = Router()

// Public routes (no authentication required)
router.post("/register", register)
router.post("/login", login)
router.post("/refresh", refresh)

// Protected routes (authentication required)
router.post("/logout", authenticate, logout)
router.get("/me", authenticate, me)

export default router