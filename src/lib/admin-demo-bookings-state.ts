import { DEMO_BOOKINGS, DEMO_CONTACTS } from "@/lib/admin-demo-data"

type DemoBooking = {
  id: string
  date: string
  time: string
  duration: number
  status: string
  nombre?: string
  telefono?: string
  clinica?: string
  email?: string
  googleMeetLink?: string | null
  createdAt?: string
  emailEvents?: Array<{
    category: string
    subject: string
    intendedRecipient?: string | null
    deliveredTo: string
    status: string
    error?: string | null
    message?: string | null
    sentAt: string
  }>
}

type DemoContact = {
  id: string
  nombre: string
  email: string
  telefono?: string
  clinica: string
  mensaje?: string
  roi?: {
    monthlyPatients?: number
    averageTicket?: number
    conversionLoss?: number
    roi?: number
  }
  booking?: {
    id: string
    date: string
    time: string
    duration: number
    status: string
  } | null
  createdAt: string
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

let demoBookingsState: DemoBooking[] = deepClone(DEMO_BOOKINGS)
let demoContactsState: DemoContact[] = deepClone(DEMO_CONTACTS)

function sortBookings(items: DemoBooking[]) {
  return [...items].sort((a, b) => +new Date(b.createdAt || b.date) - +new Date(a.createdAt || a.date))
}

function toBookingSortValue(item: DemoBooking) {
  const [hour = 0, minute = 0] = item.time.split(":").map(Number)
  const date = new Date(item.date)
  date.setHours(hour, minute, 0, 0)
  return date.getTime()
}

export function listDemoBookings() {
  return sortBookings(demoBookingsState)
}

export function getDemoBookingById(id: string) {
  return demoBookingsState.find((item) => item.id === id) || null
}

export function createDemoBooking(params: {
  date: string
  time: string
  duration: number
  email: string
  googleMeetLink: string
  emailEvents?: DemoBooking["emailEvents"]
}) {
  const maxId = demoBookingsState.reduce((max, item) => {
    const raw = Number(item.id.replace("DEMO-", ""))
    return Number.isFinite(raw) ? Math.max(max, raw) : max
  }, 0)
  const nextId = `DEMO-${String(maxId + 1).padStart(3, "0")}`
  const booking: DemoBooking = {
    id: nextId,
    date: params.date,
    time: params.time,
    duration: params.duration,
    status: "confirmed",
    nombre: "Lead Demo",
    telefono: "",
    clinica: "Nueva clínica",
    email: params.email,
    googleMeetLink: params.googleMeetLink,
    createdAt: new Date().toISOString(),
    emailEvents: params.emailEvents || [],
  }
  demoBookingsState = [booking, ...demoBookingsState]
  return booking
}

export function updateDemoBookingStatus(
  id: string,
  status: string
) {
  const booking = demoBookingsState.find((item) => item.id === id)
  if (!booking) return null
  booking.status = status
  return booking
}

export function rescheduleDemoBooking(
  id: string,
  params: { date: string; time: string; duration: number }
) {
  const booking = demoBookingsState.find((item) => item.id === id)
  if (!booking) return { booking: null, conflict: false }
  const sameDayConflict = demoBookingsState.some(
    (item) =>
      item.id !== id &&
      item.status === "confirmed" &&
      new Date(item.date).toISOString().slice(0, 10) === new Date(params.date).toISOString().slice(0, 10) &&
      item.time === params.time
  )
  if (sameDayConflict) return { booking: null, conflict: true }
  booking.date = params.date
  booking.time = params.time
  booking.duration = params.duration
  booking.googleMeetLink = `https://meet.google.com/new#booking-${booking.id}-${crypto.randomUUID()}`
  return { booking, conflict: false }
}

export function normalizeDemoHistoricalBookings(email: string, excludeId?: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return

  const relatedIds = demoBookingsState
    .filter((booking) => booking.id !== excludeId && booking.email?.trim().toLowerCase() === normalizedEmail)
    .sort((left, right) => toBookingSortValue(right) - toBookingSortValue(left))
    .map((booking) => booking.id)

  const nextStatusById = new Map(
    relatedIds.map((id, index) => [id, index < 2 ? "rescheduled" : "cancelled"])
  )

  demoBookingsState = demoBookingsState.map((booking) =>
    nextStatusById.has(booking.id)
      ? { ...booking, status: nextStatusById.get(booking.id) as string }
      : booking
  )
}

export function deleteDemoBooking(id: string) {
  const before = demoBookingsState.length
  demoBookingsState = demoBookingsState.filter((item) => item.id !== id)
  return demoBookingsState.length < before
}

export function listDemoContactsWithBookings(): DemoContact[] {
  const bookingsById = new Map(demoBookingsState.map((item) => [item.id, item]))
  return demoContactsState.map((contact) => {
    if (!contact.booking) return deepClone(contact)
    const booking = bookingsById.get(contact.booking.id)
    if (!booking) {
      return {
        ...deepClone(contact),
        booking: null,
      }
    }
    return {
      ...deepClone(contact),
      booking: {
        id: booking.id,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        status: booking.status,
      },
    }
  }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export function deleteDemoContact(id: string) {
  const before = demoContactsState.length
  demoContactsState = demoContactsState.filter((item) => item.id !== id)
  return demoContactsState.length < before
}

export function resetDemoBookingsState() {
  demoBookingsState = deepClone(DEMO_BOOKINGS)
  demoContactsState = deepClone(DEMO_CONTACTS)
}
