import { z } from 'zod'

import { PaymentMethod } from '../enums.js'

export const PlaceOrderSchema = z.object ({
    cartId: z.string().min(1),
    addressId: z.string().min(1),
    paymentMethod: z.enum(Object.values(PaymentMethod)),
})