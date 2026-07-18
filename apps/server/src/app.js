import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { getMongoStatus } from './config/database.js'
import { config } from './config/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import authRoutes from './routes/auth.routes.js'
import { success } from './utils/apiResponse.js'

export function createApp() {
  const app = express()

  // Security and middleware
  app.use(helmet())
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }))
  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'))
  app.use(express.json())
  app.use(cookieParser())

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json(
      success({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongo: getMongoStatus(),
      })
    )
  })

  app.use('/api/auth', authRoutes)

  // 404 handler (must be after all routes)
  app.use(notFound)
  app.use(errorHandler)

  return app
}
