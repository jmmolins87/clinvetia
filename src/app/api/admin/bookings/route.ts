import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-auth"
import { DEMO_BOOKINGS } from "@/lib/admin-demo-data"
import { Booking } from "@/models/Booking"
import { Contact } from "@/models/Contact"
import { dbConnect } from "@/lib/db"
import { isSuperAdmin } from "@/lib/admin-auth"
import { recordAdminAudit } from "@/lib/admin-audit"
import { sendBrevoEmail } from "@/lib/brevo"
import { leadSummaryEmail } from "@/lib/emails"
import { buildICS } from "@/lib/ics"

const updateBookingSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("status"),
    id: z.string().min(1),
    status: z.enum(["pending", "confirmed", "cancelled", "expired"]),
  }),
  z.object({
    action: z.literal("reschedule"),
    id: z.string().min(1),
    date: z.string().datetime(),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    duration: z.number().int().min(15).max(120),
  }),
  z.object({
    action: z.literal("delete"),
    id: z.string().min(1),
  }),
])

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.data.admin.role === "demo") {
    return NextResponse.json({ bookings: DEMO_BOOKINGS })
  }

  await dbConnect()
  const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean()
  const bookingIds = bookings.map((b) => String(b._id))
  const contacts = bookingIds.length
    ? await Contact.find({ bookingId: { $in: bookingIds } })
        .sort({ createdAt: -1 })
        .lean()
    : []

  const contactByBookingId = contacts.reduce(
    (acc: Record<string, (typeof contacts)[number]>, contact) => {
      const key = contact.bookingId ? String(contact.bookingId) : ""
      if (key && !acc[key]) {
        acc[key] = contact
      }
      return acc
    },
    {} as Record<string, (typeof contacts)[number]>
  )

  const visibleBookings = bookings.filter((b) => contactByBookingId[String(b._id)])

  return NextResponse.json({
    bookings: visibleBookings.map((b) => ({
      ...(contactByBookingId[String(b._id)]
        ? {
            nombre: contactByBookingId[String(b._id)].nombre,
            telefono: contactByBookingId[String(b._id)].telefono,
            clinica: contactByBookingId[String(b._id)].clinica,
            email: contactByBookingId[String(b._id)].email,
          }
        : {
            nombre: "",
            telefono: "",
            clinica: "",
            email: "",
          }),
      id: String(b._id),
      date: b.date.toISOString(),
      time: b.time,
      duration: b.duration,
      status: b.status,
    })),
  })
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isSuperAdmin(auth.data.admin.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const parsed = updateBookingSchema.parse(body)

    await dbConnect()
    const booking = await Booking.findById(parsed.id)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const rawContact = await Contact.findOne({ bookingId: { $in: [booking._id, String(booking._id)] } }).lean()
    const contact = Array.isArray(rawContact) ? rawContact[0] : rawContact
    const supportEmail = process.env.BREVO_REPLY_TO || "info@clinvetia.com"
    const brandName = "Clinvetia"

    if (parsed.action === "delete") {
      if (!["cancelled", "expired"].includes(booking.status)) {
        return NextResponse.json(
          { error: "Solo se pueden eliminar citas canceladas o expiradas" },
          { status: 409 }
        )
      }
      await Booking.deleteOne({ _id: booking._id })
    } else if (parsed.action === "status") {
      await Booking.updateOne({ _id: booking._id }, { $set: { status: parsed.status } })
      booking.status = parsed.status

      if (contact?.email && (parsed.status === "confirmed" || parsed.status === "cancelled")) {
        const [hour, min] = booking.time.split(":").map(Number)
        const start = new Date(booking.date)
        start.setHours(hour, min, 0, 0)
        const end = new Date(start)
        end.setMinutes(end.getMinutes() + booking.duration)
        const dateLabel = start.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
        const timeLabel = booking.time

        const subject =
          parsed.status === "cancelled" ? "Tu demo ha sido cancelada" : "Tu demo está confirmada"

        const attachments =
          parsed.status === "confirmed"
            ? [
                {
                  name: "clinvetia-demo.ics",
                  content: Buffer.from(
                    buildICS({
                      uid: String(booking._id),
                      start,
                      end,
                      summary: "Demo Clinvetia",
                      description: "Demo personalizada con Clinvetia",
                      location: "Videollamada",
                      organizerEmail: supportEmail,
                      attendeeEmail: contact.email,
                    })
                  ).toString("base64"),
                  contentType: "text/calendar",
                },
              ]
            : undefined

        await sendBrevoEmail({
          to: [{ email: contact.email, name: contact.nombre }],
          subject,
          htmlContent: leadSummaryEmail({
            brandName,
            nombre: contact.nombre,
            email: contact.email,
            telefono: contact.telefono,
            clinica: contact.clinica,
            mensaje: contact.mensaje,
            supportEmail,
            booking: { dateLabel, timeLabel, duration: booking.duration },
            roi: contact.roi ?? null,
          }),
          attachments,
          replyTo: { email: supportEmail },
        })
      }
    } else {
      const date = new Date(parsed.date)
      const [hour, min] = parsed.time.split(":").map(Number)
      const demoDateTime = new Date(date)
      demoDateTime.setHours(hour, min, 0, 0)
      const demoExpiresAt = new Date(demoDateTime)
      demoExpiresAt.setMinutes(demoExpiresAt.getMinutes() + parsed.duration)

      const startDay = new Date(date)
      startDay.setHours(0, 0, 0, 0)
      const endDay = new Date(date)
      endDay.setHours(23, 59, 59, 999)

      const slotConflict = await Booking.findOne({
        _id: { $ne: booking._id },
        date: { $gte: startDay, $lte: endDay },
        time: parsed.time,
        status: "confirmed",
      }).lean()
      if (slotConflict) {
        return NextResponse.json({ error: "Slot unavailable" }, { status: 409 })
      }

      if (contact?.email) {
        const sameEmailContacts = await Contact.find({
          email: contact.email,
          bookingId: { $ne: booking._id },
        })
          .select("bookingId")
          .lean()

        const otherBookingIds = sameEmailContacts
          .map((c) => c.bookingId)
          .filter(Boolean)
          .map((id) => String(id))

        if (otherBookingIds.length) {
          const duplicateActiveBooking = await Booking.findOne({
            _id: { $in: otherBookingIds, $ne: booking._id },
            status: { $in: ["pending", "confirmed"] },
            demoExpiresAt: { $gt: new Date() },
          }).lean()

          if (duplicateActiveBooking) {
            return NextResponse.json(
              { error: "Este email ya tiene una cita activa. No se pueden duplicar demos por email." },
              { status: 409 }
            )
          }
        }
      }

      const expiresAt = new Date(date)
      expiresAt.setHours(23, 59, 59, 999)
      const formExpiresAt = new Date()
      formExpiresAt.setMinutes(formExpiresAt.getMinutes() + 10)

      await Booking.updateOne(
        { _id: booking._id },
        {
          $set: {
            date,
            time: parsed.time,
            duration: parsed.duration,
            expiresAt,
            formExpiresAt,
            demoExpiresAt,
            status: "confirmed",
          },
        }
      )

      booking.date = date
      booking.time = parsed.time
      booking.duration = parsed.duration
      booking.expiresAt = expiresAt
      booking.formExpiresAt = formExpiresAt
      booking.demoExpiresAt = demoExpiresAt
      booking.status = "confirmed"

      if (contact?.email) {
        const start = new Date(date)
        start.setHours(hour, min, 0, 0)
        const end = new Date(start)
        end.setMinutes(end.getMinutes() + parsed.duration)
        const dateLabel = start.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
        const timeLabel = parsed.time

        const ics = buildICS({
          uid: String(booking._id),
          start,
          end,
          summary: "Demo Clinvetia (reagendada)",
          description: "Demo personalizada con Clinvetia - cita reagendada",
          location: "Videollamada",
          organizerEmail: supportEmail,
          attendeeEmail: contact.email,
        })

        await sendBrevoEmail({
          to: [{ email: contact.email, name: contact.nombre }],
          subject: "Tu demo ha sido reagendada",
          htmlContent: leadSummaryEmail({
            brandName,
            nombre: contact.nombre,
            email: contact.email,
            telefono: contact.telefono,
            clinica: contact.clinica,
            mensaje: contact.mensaje,
            supportEmail,
            booking: { dateLabel, timeLabel, duration: parsed.duration },
            roi: contact.roi ?? null,
          }),
          attachments: [
            {
              name: "clinvetia-demo-reagendada.ics",
              content: Buffer.from(ics).toString("base64"),
              contentType: "text/calendar",
            },
          ],
          replyTo: { email: supportEmail },
        })
      }
    }

    try {
      await recordAdminAudit({
        adminId: auth.data.admin.id,
        action:
          parsed.action === "delete"
            ? "DELETE_BOOKING"
            : parsed.action === "reschedule"
            ? "RESCHEDULE_BOOKING"
            : parsed.status === "confirmed"
              ? "ACCEPT_BOOKING"
              : parsed.status === "cancelled"
                ? "CANCEL_BOOKING"
                : "UPDATE_BOOKING_STATUS",
        targetType: "booking",
        targetId: parsed.id,
        metadata: {
          status: booking.status,
          time: booking.time,
          date: booking.date.toISOString(),
          duration: booking.duration,
          action: parsed.action,
        },
      })
    } catch (auditError) {
      console.error("Admin audit failed while updating booking", auditError)
    }

    return NextResponse.json({
      ok: true,
      booking: {
        id: String(booking._id),
        status: parsed.action === "delete" ? "deleted" : booking.status,
        date: booking.date.toISOString(),
        time: booking.time,
        duration: booking.duration,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    console.error("Admin bookings POST error", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    )
  }
}
