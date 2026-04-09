const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function formatLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseDateKey(value: string) {
  if (!DATE_KEY_REGEX.test(value)) {
    throw new Error("Invalid date key")
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date key")
  }

  return date
}

export function buildBookingDateTime(date: Date, time: string) {
  const [hour, minute] = time.split(":").map(Number)
  const nextDate = new Date(date)
  nextDate.setUTCHours(hour, minute, 0, 0)
  return nextDate
}

export function buildBookingRange(date: Date, time: string, duration: number) {
  const start = buildBookingDateTime(date, time)
  const end = new Date(start)
  end.setUTCMinutes(end.getUTCMinutes() + duration)
  return { start, end }
}

export function startOfUtcDay(date: Date) {
  const nextDate = new Date(date)
  nextDate.setUTCHours(0, 0, 0, 0)
  return nextDate
}

export function endOfUtcDay(date: Date) {
  const nextDate = new Date(date)
  nextDate.setUTCHours(23, 59, 59, 999)
  return nextDate
}

export function formatBookingDate(
  value: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const date = typeof value === "string" ? new Date(value) : value
  return date.toLocaleDateString(locale, { timeZone: "UTC", ...options })
}

export { DATE_KEY_REGEX }
