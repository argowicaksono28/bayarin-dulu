const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatIDR(amount: number): string {
  return idrFormatter.format(amount)
}

export function formatIDRShort(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp ${Math.round(amount / 1_000)}rb`
  }
  return formatIDR(amount)
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date))
}

export function formatRelative(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 30) return formatDate(d)
  if (diffDay > 0) return `${diffDay} hari lalu`
  if (diffHour > 0) return `${diffHour} jam lalu`
  if (diffMin > 0) return `${diffMin} menit lalu`
  return "Baru saja"
}
