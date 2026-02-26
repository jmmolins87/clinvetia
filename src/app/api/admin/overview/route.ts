import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { DEMO_BOOKINGS, DEMO_CONTACTS, DEMO_OVERVIEW } from "@/lib/admin-demo-data"
import { Booking } from "@/models/Booking"
import { Contact } from "@/models/Contact"
import { dbConnect } from "@/lib/db"

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
    const { labels } = buildSeriesLabels(days)
    const bookingsSeries = labels.map((_, index) => {
      const base = days === 30 ? 4 : 2
      return base + ((index * 3) % (days === 30 ? 7 : 4))
    })
    const contactsSeries = labels.map((_, index) => {
      const base = days === 30 ? 2 : 1
      return base + ((index * 2) % 3)
    })

    return NextResponse.json({
      mode: "demo",
      rangeDays: days,
      kpis: DEMO_OVERVIEW,
      recentBookings: DEMO_BOOKINGS,
      recentContacts: DEMO_CONTACTS,
      charts: {
        labels,
        bookings: bookingsSeries,
        contacts: contactsSeries,
      },
    })
  }

  await dbConnect()

  const { labels, dates } = buildSeriesLabels(days)
  const startSeriesDate = new Date(dates[0])
  const endSeriesDate = new Date(dates[dates.length - 1])
  endSeriesDate.setHours(23, 59, 59, 999)

  const [totalBookings, bookingsByStatus, recentBookings, recentContacts, bookingsSeriesAgg, contactsSeriesAgg] = await Promise.all([
    Booking.countDocuments(),
    Booking.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Contact.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
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

  const statusCounts = bookingsByStatus.reduce(
    (acc: Record<string, number>, item) => {
      acc[item._id] = item.count
      return acc
    },
    {} as Record<string, number>
  )

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
      confirmedBookings: statusCounts.confirmed || 0,
      pendingBookings: statusCounts.pending || 0,
      expiredBookings: statusCounts.expired || 0,
      cancelledBookings: statusCounts.cancelled || 0,
    },
    recentBookings: recentBookings.map((b) => ({
      id: String(b._id),
      date: b.date.toISOString(),
      time: b.time,
      duration: b.duration,
      status: b.status,
      email: "",
    })),
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
