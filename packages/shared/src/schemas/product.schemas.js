import { z } from 'zod'

import { ProductStatus } from '../enums.js'

const variantSchema = z.object({
  name: z.string().min(1),
  priceModifier: z.number().int(),
  stock: z.number().int().min(0),
})

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().positive(),
  categoryId: z.string().min(1),
  variants: z.array(variantSchema).min(1),
  status: z.enum(Object.values(ProductStatus)),
  imageUrls: z.array(z.string().url()),
})

export const UpdateProductSchema = CreateProductSchema.partial()
