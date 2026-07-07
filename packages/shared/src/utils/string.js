// Converts text to URL-friendly slugs
export function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// Generates unique order numbers: ORD-YYYYMMDD-XXXXX
export function generateOrderNumber() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let suffix = ""
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }

  return `ORD-${datePart}-${suffix}`
}