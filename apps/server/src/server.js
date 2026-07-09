import { createApp } from './app.js'

const PORT = process.env.PORT || 3000
const app = createApp()

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

// Graceful shutdown
function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`)
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })

  // Force exit if close() hangs
  setTimeout(() => process.exit(1), 10000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
