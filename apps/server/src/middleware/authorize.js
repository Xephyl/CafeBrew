import { AppError } from '../utils/AppError.js'

// Authorizes requests based on user roles
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action')
    }
    next()
  }
}
