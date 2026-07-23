import { CreateProductSchema, UpdateProductSchema } from '@shared/core'

import Product from '../models/product.model.js'
import { createProduct, deleteProduct, updateProduct } from '../services/product.service.js'
import { success } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// POST /api/products – admin
export const createProductHandler = asyncHandler(async (req, res) => {
  const data = CreateProductSchema.parse(req.body)
  const product = await createProduct(data)
  res.status(201).json(success({ product }))
})

// PUT /api/products/:id – admin
export const updateProductHandler = asyncHandler(async (req, res) => {
  const data = UpdateProductSchema.parse(req.body)
  const product = await updateProduct(req.params.id, data)
  res.status(200).json(success({ product }))
})

// DELETE /api/products/:id – admin, soft delete only
export const deleteProductHandler = asyncHandler(async (req, res) => {
  const product = await deleteProduct(req.params.id)
  res.status(200).json(success({ product }))
})

// GET /api/products — public, filter/search/paginate, active only
export const listProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, page = 1, limit = 20 } = req.query

  const query = { status: 'ACTIVE' }

  if (category) {
    query.category = category
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {}
    if (minPrice !== undefined) query.price.$gte = Number(minPrice)
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice)
  }

  if (search) {
    query.$text = { $search: search }
  }

  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1)
  const limitNum = Math.max(1, Number.parseInt(limit, 10) || 20)
  const skip = (pageNum - 1) * limitNum

  const [products, total] = await Promise.all([
    Product.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
    Product.countDocuments(query),
  ])

  res.status(200).json(
    success({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  )
})

// GET /api/products/:slug — public, active only
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'ACTIVE' })
  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found')
  }
  res.status(200).json(success({ product }))
})
