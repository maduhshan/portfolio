const monthYear = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatMonthYear(iso: string): string {
  return monthYear.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`))
}

/** "Jun 2025 to present" — the current role reads as current. */
export function formatRange(startDate: string, endDate: string | null): string {
  const start = formatMonthYear(startDate)
  return endDate ? `${start} to ${formatMonthYear(endDate)}` : `${start} to present`
}

/**
 * Signed month difference with no clamping — used to place things on the
 * timeline axis, where a zero-month offset is a real position.
 */
export function monthDiff(from: string, to: string | null): number {
  const a = new Date(`${from.slice(0, 10)}T00:00:00Z`)
  const b = to ? new Date(`${to.slice(0, 10)}T00:00:00Z`) : new Date()
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth())
}

export function monthsBetween(startDate: string, endDate: string | null): number {
  const start = new Date(`${startDate.slice(0, 10)}T00:00:00Z`)
  const end = endDate ? new Date(`${endDate.slice(0, 10)}T00:00:00Z`) : new Date()
  const months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth())
  return Math.max(months, 1)
}

export function yearOf(iso: string): number {
  return Number(iso.slice(0, 4))
}

const dayMonthYear = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : dayMonthYear.format(date)
}
