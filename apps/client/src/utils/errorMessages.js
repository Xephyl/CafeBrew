const errorMessages = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'This email is already registered',
  VALIDATION_ERROR: 'Please check the form for errors',
  NETWORK_ERROR: 'Network error. Please try again.',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
}

export function getErrorMessage(code) {
  return errorMessages[code] || 'An unexpected error occurred'
}