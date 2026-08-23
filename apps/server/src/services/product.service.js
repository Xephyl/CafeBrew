import Product from '../models/product.model.js'
import { AppError } from '../utils/AppError.js'

import { deleteProductImage } from './upload.service.js'

// Create a new product
export async function createProduct(data) {
  const { categoryId, ...rest } = data
  const product = new Product({ ...rest, category: categoryId })
  await product.save()
  return product
}

// Update a product
export async function updateProduct(id, data) {
  const product = await Product.findById(id)
  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found')
  }

  const { categoryId, ...rest } = data
  for (const [key, value] of Object.entries(rest)) {
    if (value != undefined) product[key] = value
  }
  if (categoryId != undefined) product.category = categoryId

  await product.save()
  return product
}

// Soft delete only – status flips to INACTIVE
export async function deleteProduct(id) {
  const product = await Product.findById(id)
  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found')
  }

  await Promise.all(product.imagePaths.map((path) => deleteProductImage(path)))

  product.status = 'INACTIVE'
  await product.save()
  return product
}
