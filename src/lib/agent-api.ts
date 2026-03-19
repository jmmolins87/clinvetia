import { buildGoogleMeetLink } from "@/lib/booking-communication"
import { dbConnect } from "@/lib/db"
import { expireOverdueBookings } from "@/lib/booking-expiration"
import { Booking } from "@/models/Booking"
import { Contact } from "@/models/Contact"

type ROINode = {
  monthlyPatients?: number | null
  averageTicket?: number | null
  conversionLoss?: number | null
  roi?: number | null
} | null | undefined

const BOOKING_STATUSES = new Set(["pending", "confirmed", "expired", "cancelled", "rescheduled"])

function hasCompleteROI(roi: ROINode) {
  return (
    typeof roi?.monthlyPatients === "number" &&
    typeof roi?.averageTicket === "number" &&
    typeof roi?.conversionLoss === "number" &&
    typeof roi?.roi === "number"
  )
}

function buildSeriesDates(count: number) {
  const labels: string[] = []
  const dates: Date[] = []
  const today = new Date()

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(today)
    date.setHours(0, 0, 0, 0)
    date.setDate(today.getDate() - index)
    dates.push(date)
    labels.push(date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }))
  }

  return { labels, dates }
}

function parseDateInput(value: string | null, endOfDay = false) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0)
  }

  return date
}

function normalizeStatuses(value: string | null) {
  if (!value) return []

  return value
    .split(",")
    .map((status) => status.trim().toLowerCase())
    .filter((status): status is "pending" | "confirmed" | "expired" | "cancelled" | "rescheduled" => BOOKING_STATUSES.has(status))
}

function normalizeLimit(value: string | null, defaultValue: number) {
  if (!value) return defaultValue
  const numericValue = Number.parseInt(value, 10)
  if (Number.isNaN(numericValue)) return defaultValue
  return Math.min(Math.max(numericValue, 1), 200)
}

function getContactROI(value: unknown): ROINode {
  if (!value || typeof value !== "object" || !("roi" in value)) return undefined
  return (value as { roi?: ROINode }).roi
}

function selectPreferredContact<T>(current: T | undefined, next: T) {
  if (!current) return next
  if (!hasCompleteROI(getContactROI(current)) && hasCompleteROI(getContactROI(next))) return next
  return current
}

export function parseCalendarFilters(searchParams: URLSearchParams) {
  const from = parseDateInput(searchParams.get("from"))
  const to = parseDateInput(searchParams.get("to"), true)
  const statuses = normalizeStatuses(searchParams.get("status"))
  const limit = normalizeLimit(searchParams.get("limit"), 100)

  return {
    from,
    to,
    statuses,
    limit,
  }
}

export function parseDashboardRange(searchParams: URLSearchParams) {
  const range = searchParams.get("range")
  return range === "30" ? 30 : 7
}

export async function getAgentCalendarPayload(filters: ReturnType<typeof parseCalendarFilters>) {
  await dbConnect()
  await expireOverdueBookings()

  const query: Record<string, unknown> = {}

  if (filters.from || filters.to) {
    query.date = {
      ...(filters.from ? { $gte: filters.from } : {}),
      ...(filters.to ? { $lte: filters.to } : {}),
    }
  }

  if (filters.statuses.length) {
    query.status = { $in: filters.statuses }
  }

  const bookings = await Booking.find(query)
    .sort({ date: 1, time: 1, createdAt: -1 })
    .limit(filters.limit)
    .lean()

  const bookingIds = bookings.map((booking) => String(booking._id))
  const bookingObjectIds = bookings.map((booking) => booking._id)
  const contacts = bookingIds.length
    ? await Contact.find({ bookingId: { $in: [...bookingIds, ...bookingObjectIds] } })
        .sort({ createdAt: -1 })
        .lean()
    : []

  const contactByBookingId = contacts.reduce(
    (acc: Record<string, (typeof contacts)[number]>, contact) => {
      const key = contact.bookingId ? String(contact.bookingId) : ""
      if (key) {
        acc[key] = selectPreferredContact(acc[key], contact)
      }
      return acc
    },
    {} as Record<string, (typeof contacts)[number]>
  )

  const countsByStatus = bookings.reduce(
    (acc: Record<string, number>, booking) => {
      acc[booking.status] = (acc[booking.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return {
    generatedAt: new Date().toISOString(),
    filters: {
      from: filters.from?.toISOString() ?? null,
      to: filters.to?.toISOString() ?? null,
      status: filters.statuses,
      limit: filters.limit,
    },
    summary: {
      total: bookings.length,
      pending: countsByStatus.pending ?? 0,
      confirmed: countsByStatus.confirmed ?? 0,
      expired: countsByStatus.expired ?? 0,
      cancelled: countsByStatus.cancelled ?? 0,
      rescheduled: countsByStatus.rescheduled ?? 0,
    },
    bookings: bookings.map((booking) => {
      const contact = contactByBookingId[String(booking._id)]

      return {
        id: String(booking._id),
        date: booking.date.toISOString(),
        time: booking.time,
        duration: booking.duration,
        status: booking.status,
        createdAt: booking.createdAt?.toISOString?.() ?? null,
        updatedAt: booking.updatedAt?.toISOString?.() ?? null,
        expiresAt: booking.expiresAt?.toISOString?.() ?? null,
        formExpiresAt: booking.formExpiresAt?.toISOString?.() ?? null,
        demoExpiresAt: booking.demoExpiresAt?.toISOString?.() ?? null,
        googleMeetLink: booking.googleMeetLink || buildGoogleMeetLink(String(booking._id)),
        emailEvents: Array.isArray(booking.emailEvents) ? booking.emailEvents : [],
        contact: contact
          ? {
              nombre: contact.nombre,
              email: contact.email,
              telefono: contact.telefono,
              clinica: contact.clinica,
              mensaje: contact.mensaje,
              createdAt: contact.createdAt?.toISOString?.() ?? null,
              roi: hasCompleteROI(contact.roi) ? contact.roi : null,
            }
          : null,
      }
    }),
  }
}

export async function getAgentDashboardPayload(rangeDays: number) {
  await dbConnect()
  await expireOverdueBookings()

  const { labels, dates } = buildSeriesDates(rangeDays)
  const startSeriesDate = new Date(dates[0])
  const endSeriesDate = new Date(dates[dates.length - 1])
  endSeriesDate.setHours(23, 59, 59, 999)

  const [allBookings, totalContacts, recentContacts, bookingsSeriesAgg, contactsSeriesAgg] = await Promise.all([
    Booking.find({}).sort({ createdAt: -1 }).lean(),
    Contact.countDocuments({}),
    Contact.find({}).sort({ createdAt: -1 }).limit(10).lean(),
    Booking.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: startSeriesDate, $lte: endSeriesDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Contact.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: startSeriesDate, $lte: endSeriesDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ])

  const recentBookings = allBookings.slice(0, 10)
  const recentBookingIds = recentBookings.map((booking) => String(booking._id))
  const recentBookingObjectIds = recentBookings.map((booking) => booking._id)
  const recentSessionTokens = recentBookings
    .map((booking) => booking.sessionToken)
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)

  const [bookingContacts, sessionContacts] = await Promise.all([
    recentBookingIds.length
      ? Contact.find({ bookingId: { $in: [...recentBookingIds, ...recentBookingObjectIds] } }).sort({ createdAt: -1 }).lean()
      : [],
    recentSessionTokens.length
      ? Contact.find({ sessionToken: { $in: recentSessionTokens } }).sort({ createdAt: -1 }).lean()
      : [],
  ])

  const contactByBookingId = bookingContacts.reduce(
    (acc: Record<string, (typeof bookingContacts)[number]>, contact) => {
      const key = contact.bookingId ? String(contact.bookingId) : ""
      if (key) {
        acc[key] = selectPreferredContact(acc[key], contact)
      }
      return acc
    },
    {} as Record<string, (typeof bookingContacts)[number]>
  )

  const contactBySessionToken = sessionContacts.reduce(
    (acc: Record<string, (typeof sessionContacts)[number]>, contact) => {
      const key = typeof contact.sessionToken === "string" ? contact.sessionToken : ""
      if (key) {
        acc[key] = selectPreferredContact(acc[key], contact)
      }
      return acc
    },
    {} as Record<string, (typeof sessionContacts)[number]>
  )

  const bookingsByStatus = allBookings.reduce(
    (acc: Record<string, number>, booking) => {
      acc[booking.status] = (acc[booking.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const bookingsSeriesMap = bookingsSeriesAgg.reduce(
    (acc: Record<string, number>, item) => {
      acc[item._id] = item.count
      return acc
    },
    {} as Record<string, number>
  )

  const contactsSeriesMap = contactsSeriesAgg.reduce(
    (acc: Record<string, number>, item) => {
      acc[item._id] = item.count
      return acc
    },
    {} as Record<string, number>
  )

  return {
    generatedAt: new Date().toISOString(),
    rangeDays,
    kpis: {
      totalBookings: allBookings.length,
      totalContacts,
      confirmedBookings: bookingsByStatus.confirmed ?? 0,
      pendingBookings: bookingsByStatus.pending ?? 0,
      expiredBookings: bookingsByStatus.expired ?? 0,
      cancelledBookings: bookingsByStatus.cancelled ?? 0,
    },
    recentBookings: recentBookings.map((booking) => {
      const bookingContact = contactByBookingId[String(booking._id)]
      const sessionContact = booking.sessionToken ? contactBySessionToken[booking.sessionToken] : undefined
      const selectedContact =
        bookingContact && hasCompleteROI(bookingContact.roi)
          ? bookingContact
          : sessionContact && hasCompleteROI(sessionContact.roi)
            ? sessionContact
            : bookingContact ?? sessionContact

      return {
        id: String(booking._id),
        date: booking.date.toISOString(),
        time: booking.time,
        duration: booking.duration,
        status: booking.status,
        googleMeetLink: booking.googleMeetLink || buildGoogleMeetLink(String(booking._id)),
        emailEvents: Array.isArray(booking.emailEvents) ? booking.emailEvents : [],
        contact: selectedContact
          ? {
              nombre: selectedContact.nombre,
              telefono: selectedContact.telefono,
              clinica: selectedContact.clinica,
              email: selectedContact.email,
              mensaje: selectedContact.mensaje,
              roi: hasCompleteROI(selectedContact.roi) ? selectedContact.roi : null,
            }
          : null,
      }
    }),
    recentContacts: recentContacts.map((contact) => ({
      id: String(contact._id),
      nombre: contact.nombre,
      email: contact.email,
      clinica: contact.clinica,
      createdAt: contact.createdAt.toISOString(),
      roi: hasCompleteROI(contact.roi) ? contact.roi : null,
    })),
    charts: {
      labels,
      bookings: dates.map((date) => bookingsSeriesMap[date.toISOString().slice(0, 10)] ?? 0),
      contacts: dates.map((date) => contactsSeriesMap[date.toISOString().slice(0, 10)] ?? 0),
    },
  }
}
