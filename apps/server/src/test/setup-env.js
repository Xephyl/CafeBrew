import path from "node:path"
import { fileURLToPath } from "node:url"

// Runs before any app module is imported — config/index.js validates env at import time.
process.env.NODE_ENV = process.env.NODE_ENV || "test"
process.env.PORT = process.env.PORT || "3000"
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cafe_ecommerce_test"
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173"
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret"
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-refresh-secret"
process.env.XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || "test-xendit-key"
process.env.XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || "test-callback-token"
process.env.SUPABASE_URL = process.env.SUPABASE_URL || "https://example.supabase.co"
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "test-service-role-key"

// Reuse the mongod binary that pnpm's postinstall already downloaded at the workspace root,
// instead of each Jest worker re-downloading ~780MB into a different cache dir.
const here = path.dirname(fileURLToPath(import.meta.url))
process.env.MONGOMS_DOWNLOAD_DIR =
  process.env.MONGOMS_DOWNLOAD_DIR ||
  path.resolve(here, "../../../../node_modules/.cache/mongodb-memory-server")
