import { ZodError } from 'zod'

import { error } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'

// Single error handler for the entire app
export function errorHandler(err, req, res, _next) {
  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(error(err.code, err.message, err.details))
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const details = {}
    for (const issue of err.issues) {
      const field = issue.path.join('.') || 'root'
      details[field] = issue.message
    }
    return res.status(422).json(error('VALIDATION_ERROR', 'Validation failed', details))
  }

  // MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field'
    return res.status(409).json(error('DUPLICATE_ENTRY', `${field} already exists`, err.keyValue))
  }

  // Unknown errors – log them, hide details in production
  console.error(err)
  const isProd = process.env.NODE_ENV === 'production'
  const details = isProd ? undefined : { stack: err.stack }
  return res.status(500).json(error('INTERNAL_ERROR', 'Something went wrong', details))
}
