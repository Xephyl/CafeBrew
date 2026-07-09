// Standard response builders – use these everywhere
export function success(data, message) {
  const body = { success: true, data }
  if (message) body.message = message
  return body
}

export function error(code, message, details) {
  const body = { success: false, error: { code, message } }
  if (details) body.error.details = details
  return body
}
