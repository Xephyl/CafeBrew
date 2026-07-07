import { z } from "zod"

// Password: min 8 chars, 1 uppercase, 1 number
const passwordRule = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: passwordRule,
    firstName: z.string().min(1),
    lastName: z.string().min(1)
})

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
})