export function formatPrice(price: number): string {
  return `Rs. ${price.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function generateOrderNumber(): string {
  return `SHM-${Date.now().toString(36).toUpperCase()}`
}

export function parseJSON<T>(str: string, fallback: T): T {
  try { return JSON.parse(str) } catch { return fallback }
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + '...' : text
}

export const SHIPPING_COST = 200
export const FREE_SHIPPING_THRESHOLD = 5000
