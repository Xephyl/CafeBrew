import { z } from 'zod'

// Validates Xendit's webhook payload
export const XenditWebhookSchema = z.object({
    id: z.string(),
    external_id: z.string(),
    status: z.string(),
    amount: z.number(),
    paid_at: z.string().nullable().optional(),
})
