import { z } from 'zod'

export const AddToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
})
