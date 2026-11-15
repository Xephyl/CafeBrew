// Formats currency (PHP by default). `amount` is in MAJOR units (e.g. 1500 → ₱1,500.00).
// Prices in this project are stored as integer centavos — use formatPrice() for those.
export function formatCurrency(amount, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Formats an integer centavos price (the project's storage unit) for display.
export function formatPrice(centavos, currency = 'PHP') {
  return formatCurrency(centavos / 100, currency)
}

// Formats ISO date strings into readable formats
export function formatDate(isoString, format = 'YYYY-MM-DD') {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`formatDate: invalid ISO string "${isoString}"`)
  }

  const pad = (n) => String(n).padStart(2, '0')

  const tokens = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => tokens[match])
}
