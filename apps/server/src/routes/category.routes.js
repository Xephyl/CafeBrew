import { Router } from "express"

import {
  createCategory,
  deleteCategory,
  getCategoryBySlug,
  listCategories,
  updateCategory,
} from "../controllers/category.controller.js"
import { authenticate } from "../middleware/authenticate.js"
import { authorize } from "../middleware/authorize.js"

const router = Router()

router.get("/", listCategories)
router.get("/:slug", getCategoryBySlug)
router.post("/", authenticate, authorize("ADMIN"), createCategory)
router.put("/:id", authenticate, authorize("ADMIN"), updateCategory)
router.delete("/:id", authenticate, authorize("ADMIN"), deleteCategory)

export default router