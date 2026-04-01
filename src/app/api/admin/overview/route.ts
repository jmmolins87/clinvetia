import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { Booking } from "@/models/Booking"
import { Contact } from "@/models/Contact"
import { dbConnect } from "@/lib/db"
import { buildGoogleMeetLink } from "@/lib/booking-communication"
import { expireOverdueBookings } from "@/lib/booking-expiration"
import { listDemoBookings, listDemoContactsWithBookings } from "@/lib/admin-demo-bookings-state"

type ROINode = {
  monthlyPatients?: number | null
  averageTicket?: number | null
  conversionLoss?: number | null
  roi?: number | null
} | null | undefined

function hasCompleteROI(roi: ROINode) {
  return (
    typeof roi?.monthlyPatients === "number" &&
    typeof roi?.averageTicket === "number" &&
    typeof roi?.conversionLoss === "number" &&
    typeof roi?.roi === "number"
  )
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = auth.data.admin.role
  const { searchParams } = new URL(req.url)
  const rangeParam = searchParams.get("range")
  const days = rangeParam === "30" ? 30 : 7

  const buildSeriesLabels = (count: number) => {
    const labels: string[] = []
    const dates: Date[] = []
    const today = new Date()
    for (let i = count - 1; i >= 0; i -= 1) {
      const d = new Date(today)
      d.setHours(0, 0, 0, 0)
      d.setDate(today.getDate() - i)
      dates.push(d)
      labels.push(d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }))
    }
    return { labels, dates }
  }

  if (role === "demo") {
    const demoBookings = listDemoBookings()
    const demoContacts = listDemoContactsWithBookings()
    const demoStatusCounts = demoBookings.reduce(
      (acc: Record<string, number>, booking) => {
        acc[booking.status] = (acc[booking.status] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const { labels, dates } = buildSeriesLabels(days)
    const bookingsSeries = dates.map((date) => {
      const key = date.toISOString().slice(0, 10)
      return demoBookings.filter((item) => new Date(item.createdAt || item.date).toISOString().slice(0, 10) === key).length
    })
    const contactsSeries = dates.map((date) => {
      const key = date.toISOString().slice(0, 10)
      return demoContacts.filter((item) => new Date(item.createdAt).toISOString().slice(0, 10) === key).length
    })

    return NextResponse.json({
      mode: "demo",
      rangeDays: days,
      kpis: {
        totalBookings: demoBookings.length,
        totalContacts: demoContacts.length,
        confirmedBookings: demoStatusCounts.confirmed || 0,
        pendingBookings: demoStatusCounts.pending || 0,
        expiredBookings: demoStatusCounts.expired || 0,
        cancelledBookings: demoStatusCounts.cancelled || 0,
      },
      recentBookings: demoBookings.slice(0, 5).map((booking) => {
        const contact = demoContacts.find((item) => item.booking?.id === booking.id)
        return {
          ...booking,
          mensaje: contact?.mensaje || "",
          roi: contact?.roi || null,
          googleMeetLink: buildGoogleMeetLink(booking.id),
          emailEvents: booking.emailEvents || [],
        }
      }),
      recentContacts: demoContacts.slice(0, 5),
      charts: {
        labels,
        bookings: bookingsSeries,
        contacts: contactsSeries,
      },
    })
  }

  await dbConnect()
  await expireOverdueBookings()

  const { labels, dates } = buildSeriesLabels(days)
  const startSeriesDate = new Date(dates[0])
  const endSeriesDate = new Date(dates[dates.length - 1])
  endSeriesDate.setHours(23, 59, 59, 999)

  const [allBookings, totalContacts, recentContacts, bookingsSeriesAgg, contactsSeriesAgg] = await Promise.all([
    Booking.find({}).sort({ createdAt: -1 }).lean(),
    Contact.countDocuments({}),
    Contact.find({}).sort({ createdAt: -1 }).limit(5).lean(),
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

  const recentBookings = allBookings.slice(0, 5)
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

  const pickPreferredContact = (
    current: (typeof bookingContacts)[number] | undefined,
    next: (typeof bookingContacts)[number]
  ) => {
    if (!current) return next
    if (!hasCompleteROI(current.roi) && hasCompleteROI(next.roi)) return next
    return current
  }

  const contactByBookingId = bookingContacts.reduce(
    (acc: Record<string, (typeof bookingContacts)[number]>, contact) => {
      const key = contact.bookingId ? String(contact.bookingId) : ""
      if (key) acc[key] = pickPreferredContact(acc[key], contact)
      return acc
    },
    {} as Record<string, (typeof bookingContacts)[number]>
  )
  const contactBySessionToken = sessionContacts.reduce(
    (acc: Record<string, (typeof sessionContacts)[number]>, contact) => {
      const key = typeof contact.sessionToken === "string" ? contact.sessionToken : ""
      if (key) acc[key] = pickPreferredContact(acc[key], contact)
      return acc
    },
    {} as Record<string, (typeof sessionContacts)[number]>
  )

  const bookingsByStatus = allBookings.reduce(
    (acc: Record<string, number>, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const totalBookings = allBookings.length

  const statusCounts = bookingsByStatus

  const bookingSeriesMap = bookingsSeriesAgg.reduce(
    (acc: Record<string, number>, item) => {
      acc[item._id] = item.count
      return acc
    },
    {} as Record<string, number>
  )

  const contactSeriesMap = contactsSeriesAgg.reduce(
    (acc: Record<string, number>, item) => {
      acc[item._id] = item.count
      return acc
    },
    {} as Record<string, number>
  )

  const bookingSeries = dates.map((date) => {
    const key = date.toISOString().slice(0, 10)
    return bookingSeriesMap[key] || 0
  })

  const contactSeries = dates.map((date) => {
    const key = date.toISOString().slice(0, 10)
    return contactSeriesMap[key] || 0
  })

  return NextResponse.json({
    mode: "superadmin",
    rangeDays: days,
    kpis: {
      totalBookings,
      totalContacts,
      confirmedBookings: statusCounts.confirmed || 0,
      pendingBookings: statusCounts.pending || 0,
      expiredBookings: statusCounts.expired || 0,
      cancelledBookings: statusCounts.cancelled || 0,
    },
    recentBookings: recentBookings.map((b) => {
      const bookingContact = contactByBookingId[String(b._id)]
      const sessionContact = b.sessionToken ? contactBySessionToken[b.sessionToken] : undefined
      const selectedContact =
        bookingContact && hasCompleteROI(bookingContact.roi)
          ? bookingContact
          : sessionContact && hasCompleteROI(sessionContact.roi)
            ? sessionContact
            : bookingContact ?? sessionContact

      return {
        ...(selectedContact
          ? {
              nombre: selectedContact.nombre,
              telefono: selectedContact.telefono,
              clinica: selectedContact.clinica,
              email: selectedContact.email,
              mensaje: selectedContact.mensaje,
              roi: hasCompleteROI(selectedContact.roi) ? selectedContact.roi : null,
            }
          : {
              nombre: "",
              telefono: "",
              clinica: "",
              email: "",
              mensaje: "",
              roi: null,
            }),
        id: String(b._id),
        date: b.date.toISOString(),
        time: b.time,
        duration: b.duration,
        status: b.status,
        googleMeetLink: b.googleMeetLink || buildGoogleMeetLink(String(b._id)),
        conversationSummary: typeof b.conversationSummary === "string" ? b.conversationSummary : "",
        conversationMessages: Array.isArray(b.conversationMessages)
          ? b.conversationMessages.map((message) => ({
              role: message.role,
              content: message.content,
              timestamp:
                message.timestamp instanceof Date
                  ? message.timestamp.toISOString()
                  : message.timestamp
                    ? new Date(message.timestamp).toISOString()
                    : new Date(b.createdAt).toISOString(),
            }))
          : [],
        emailEvents: Array.isArray(b.emailEvents) ? b.emailEvents : [],
      }
    }),
    recentContacts: recentContacts.map((c) => ({
      id: String(c._id),
      nombre: c.nombre,
      email: c.email,
      clinica: c.clinica,
      createdAt: c.createdAt.toISOString(),
    })),
    charts: {
      labels,
      bookings: bookingSeries,
      contacts: contactSeries,
    },
  })
}
