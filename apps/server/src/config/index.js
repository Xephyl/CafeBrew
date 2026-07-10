import dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

// Configuration schema for environment variables
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  PORT: z.string().min(1).default("3000"),
  NODE_ENV: z.string().min(1).default("development"),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  XENDIT_SECRET_KEY: z.string().min(1, "XENDIT_SECRET_KEY is required"),
  XENDIT_CALLBACK_TOKEN: z.string().min(1, "XENDIT_CALLBACK_TOKEN is required"),
  SUPABASE_URL: z.string().min(1, "SUPABASE_URL is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const missing = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")
  console.error(`Cannot start: missing or invalid required environment variables: ${missing}`)
  process.exit(1)
}

// Never log parsed.data directly elsewhere in the app - it contains every secret above.
export const config = parsed.data