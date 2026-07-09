import { AppError } from '../utils/AppError.js'

// Handles 404s – passes to errorHandler
export function notFound(req, res, next) {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`))
}
