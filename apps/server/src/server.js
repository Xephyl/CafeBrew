import mongoose from "mongoose"

import { createApp } from "./app.js"
import { connectDB } from "./config/database.js"
import { config } from "./config/index.js"

async function start() {
  await connectDB(config.MONGODB_URI)

  const app = createApp()

  const server = app.listen(config.PORT, () => {
    console.log(`Server listening on port ${config.PORT}`)
  })

  // Graceful shutdown
  function shutdown(signal) {
    console.log(`${signal} received, shutting down gracefully`)
    server.close(async () => {
      await mongoose.connection.close()
      console.log("Server closed")
      process.exit(0)
    })

    // Force exit if close() hangs
    setTimeout(() => process.exit(1), 10000).unref()
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"))
  process.on("SIGINT", () => shutdown("SIGINT"))
}

try {
  await start()
} catch (err) {
  console.error(`Failed to start server: ${err.message}`)
  process.exit(1)
}