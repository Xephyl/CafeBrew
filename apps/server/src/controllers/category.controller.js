import Category from '../models/category.model.js'
import { success } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/categories — public, active only, flat list ordered for display
export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 })
  res.status(200).json(success({ categories }))
})

// GET /api/categories/:slug — public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true })
  if (!category) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found')
  }
  res.status(200).json(success({ category }))
})

// POST /api/categories — admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, imageUrl, displayOrder } = req.body
  if (!name) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Validation failed', { name: 'name is required' })
  }

  const category = new Category({ name, description, imageUrl, displayOrder })
  await category.save()
  res.status(201).json(success({ category }))
})

// PUT /api/categories/:id — admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found')
  }

  const { name, description, imageUrl, displayOrder, isActive } = req.body
  if (name !== undefined) category.name = name
  if (description !== undefined) category.description = description
  if (imageUrl !== undefined) category.imageUrl = imageUrl
  if (displayOrder !== undefined) category.displayOrder = displayOrder
  if (isActive !== undefined) category.isActive = isActive

  await category.save()
  res.status(200).json(success({ category }))
})

// DELETE /api/categories/:id — admin, soft delete only
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found')
  }

  category.isActive = false
  await category.save()
  res.status(200).json(success({ category }))
})
