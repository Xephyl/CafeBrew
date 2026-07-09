// Custom error class for known application errors
export class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message || code)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}
