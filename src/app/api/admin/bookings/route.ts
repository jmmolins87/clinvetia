import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-auth"
import { Booking } from "@/models/Booking"
import { Contact } from "@/models/Contact"
import { dbConnect } from "@/lib/db"
import { isSuperAdmin } from "@/lib/admin-auth"
import { recordAdminAudit } from "@/lib/admin-audit"
import { getSharedMailboxEmail } from "@/lib/admin-mailbox"
import { addDemoSentMail } from "@/lib/admin-demo-mail-state"
import { sendBrevoEmail } from "@/lib/brevo"
import { leadSummaryEmail } from "@/lib/emails"
import { buildICS } from "@/lib/ics"
import {
  appendBookingEmailEvent,
  buildGoogleMeetLink,
} from "@/lib/booking-communication"
import { clearRoiForBookingContext } from "@/lib/roi-cleanup"
import { expireOverdueBookings } from "@/lib/booking-expiration"
import { isBookableDemoTimeSlot, isValidDemoTimeSlot } from "@/lib/demo-schedule"
import {
  createDemoBooking,
  deleteDemoBooking,
  getDemoBookingById,
  listDemoBookings,
  normalizeDemoHistoricalBookings,
  rescheduleDemoBooking,
  updateDemoBookingStatus,
} from "@/lib/admin-demo-bookings-state"

const updateBookingSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("status"),
    id: z.string().min(1),
    status: z.enum(["pending", "confirmed", "cancelled", "expired", "rescheduled"]),
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
  z.object({
    action: z.literal("create"),
    date: z.string().datetime(),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    duration: z.number().int().min(15).max(120),
    email: z.string().email(),
  }),
])

function buildCreateBookingDeliveryTargets(customerEmail: string) {
  const sharedMailbox = getSharedMailboxEmail()
  const normalizedCustomerEmail = customerEmail.trim().toLowerCase()

  return Array.from(
    new Set([
      normalizedCustomerEmail,
      sharedMailbox,
    ].filter((value): value is string => Boolean(value)))
  )
}

async function normalizeHistoricalBookingsByEmail(email: string, excludeBookingId?: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return

  const relatedContacts = await Contact.find({ email: normalizedEmail }).select("bookingId").lean()
  const relatedBookingIds = relatedContacts
    .map((contact) => contact.bookingId)
    .filter(Boolean)
    .map((id) => String(id))
    .filter((id) => id !== excludeBookingId)

  if (!relatedBookingIds.length) return

  const relatedBookings = await Booking.find({ _id: { $in: relatedBookingIds } })
    .select("_id date time")
    .lean()

  const sortedIds = relatedBookings
    .map((booking) => {
      const [hour = 0, minute = 0] = booking.time.split(":").map(Number)
      const date = new Date(booking.date)
      date.setHours(hour, minute, 0, 0)
      return { id: String(booking._id), sortValue: date.getTime() }
    })
    .sort((left, right) => right.sortValue - left.sortValue)
    .map((item) => item.id)

  const rescheduledIds = sortedIds.slice(0, 2)
  const cancelledIds = sortedIds.slice(2)

  if (rescheduledIds.length) {
    await Booking.updateMany({ _id: { $in: rescheduledIds } }, { $set: { status: "rescheduled" } })
  }

  if (cancelledIds.length) {
    await Booking.updateMany({ _id: { $in: cancelledIds } }, { $set: { status: "cancelled" } })
  }
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.data.admin.role === "demo") {
    return NextResponse.json({ bookings: listDemoBookings() })
  }

  await dbConnect()
  await expireOverdueBookings()
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

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      ...(contactByBookingId[String(b._id)]
        ? {
            nombre: contactByBookingId[String(b._id)].nombre,
            telefono: contactByBookingId[String(b._id)].telefono,
            clinica: contactByBookingId[String(b._id)].clinica,
            email: contactByBookingId[String(b._id)].email,
            mensaje: contactByBookingId[String(b._id)].mensaje,
          }
        : {
            nombre: "",
            telefono: "",
            clinica: "",
            email: "",
            mensaje: "",
          }),
      id: String(b._id),
      date: b.date.toISOString(),
      time: b.time,
      duration: b.duration,
      status: b.status,
      googleMeetLink: b.googleMeetLink ?? null,
      emailEvents: Array.isArray(b.emailEvents) ? b.emailEvents : [],
    })),
  })
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const isDemo = auth.data.admin.role === "demo"
  if (!isSuperAdmin(auth.data.admin.role) && !isDemo) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const parsed = updateBookingSchema.parse(body)

    if (isDemo) {
      if (parsed.action === "create") {
        if (!isValidDemoTimeSlot(parsed.time) || !isBookableDemoTimeSlot(parsed.time)) {
          return NextResponse.json({ error: "Slot unavailable" }, { status: 409 })
        }
        const customerEmail = parsed.email.trim().toLowerCase()
        const supportEmail = getSharedMailboxEmail()
        const deliveryTargets = buildCreateBookingDeliveryTargets(customerEmail)
        const meetingLink = buildGoogleMeetLink(`demo-${crypto.randomUUID()}`)
        const start = new Date(parsed.date)
        const [hour, min] = parsed.time.split(":").map(Number)
        start.setHours(hour, min, 0, 0)
        const dateLabel = start.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
        const subject = "Tu demo está confirmada"
        const htmlContent = leadSummaryEmail({
          brandName: "Clinvetia",
          nombre: customerEmail,
          email: customerEmail,
          telefono: "-",
          clinica: "Nueva clínica",
          mensaje: "Cita creada manualmente desde el panel de administración.",
          supportEmail,
          booking: {
            dateLabel,
            timeLabel: parsed.time,
            duration: parsed.duration,
            meetingLink,
          },
          roi: null,
        })
        const created = createDemoBooking({
          date: parsed.date,
          time: parsed.time,
          duration: parsed.duration,
          email: customerEmail,
          googleMeetLink: meetingLink,
          emailEvents: deliveryTargets.map((target) => ({
            category: "booking_confirmed",
            subject,
            intendedRecipient: customerEmail,
            deliveredTo: target,
            status: "sent",
            error: null,
            message: "Cita creada manualmente desde administración.",
            sentAt: new Date().toISOString(),
          })),
        })
        for (const target of deliveryTargets) {
          addDemoSentMail({
            mailbox: target === supportEmail ? "shared" : "self",
            demoUserEmail: auth.data.admin.email,
            to: target,
            customerName: target === customerEmail ? customerEmail : "Clinvetia",
            subject,
            body: htmlContent,
          })
        }
        normalizeDemoHistoricalBookings(customerEmail)
        return NextResponse.json({ ok: true, booking: created })
      }

      if (parsed.action === "delete") {
        const booking = getDemoBookingById(parsed.id)
        if (!booking) {
          return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }
        if (["cancelled", "expired"].includes(booking.status)) {
          deleteDemoBooking(parsed.id)
          return NextResponse.json({ ok: true })
        }
        const updated = updateDemoBookingStatus(parsed.id, "cancelled")
        if (!updated) {
          return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }
        return NextResponse.json({ ok: true, booking: updated })
      }

      if (parsed.action === "status") {
        const updated = updateDemoBookingStatus(parsed.id, parsed.status)
        if (!updated) {
          return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }
        return NextResponse.json({ ok: true, booking: updated })
      }

      if (!isValidDemoTimeSlot(parsed.time) || !isBookableDemoTimeSlot(parsed.time)) {
        return NextResponse.json({ error: "Slot unavailable" }, { status: 409 })
      }
      const result = rescheduleDemoBooking(parsed.id, {
        date: parsed.date,
        time: parsed.time,
        duration: parsed.duration,
      })
      if (result.conflict) {
        return NextResponse.json({ error: "Slot unavailable" }, { status: 409 })
      }
      if (!result.booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }
      if (result.booking.email) {
        normalizeDemoHistoricalBookings(result.booking.email, result.booking.id)
      }
      return NextResponse.json({ ok: true, booking: result.booking })
    }

    await dbConnect()
    if (parsed.action === "create") {
      if (!isValidDemoTimeSlot(parsed.time) || !isBookableDemoTimeSlot(parsed.time)) {
        return NextResponse.json({ error: "Slot unavailable" }, { status: 409 })
      }

      const customerEmail = parsed.email.trim().toLowerCase()
      const date = new Date(parsed.date)
      const [hour, min] = parsed.time.split(":").map(Number)
      const start = new Date(date)
      start.setHours(hour, min, 0, 0)
      const end = new Date(start)
      end.setMinutes(end.getMinutes() + parsed.duration)
      const demoExpiresAt = new Date(end)
      const expiresAt = new Date(date)
      expiresAt.setHours(23, 59, 59, 999)
      const formExpiresAt = new Date()
      formExpiresAt.setMinutes(formExpiresAt.getMinutes() + 10)
      const supportEmail = getSharedMailboxEmail()
      const brandName = "Clinvetia"

      const startDay = new Date(date)
      startDay.setHours(0, 0, 0, 0)
      const endDay = new Date(date)
      endDay.setHours(23, 59, 59, 999)

      const slotConflict = await Booking.findOne({
        date: { $gte: startDay, $lte: endDay },
        time: parsed.time,
        status: "confirmed",
      }).lean()
      if (slotConflict) {
        return NextResponse.json({ error: "Slot unavailable" }, { status: 409 })
      }

      const duplicateContacts = await Contact.find({ email: customerEmail }).select("bookingId").lean()
      const duplicateBookingIds = duplicateContacts
        .map((contact) => contact.bookingId)
        .filter(Boolean)
        .map((id) => String(id))

      if (duplicateBookingIds.length) {
        const duplicateActiveBooking = await Booking.findOne({
          _id: { $in: duplicateBookingIds },
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

      const booking = await Booking.create({
        date,
        time: parsed.time,
        duration: parsed.duration,
        status: "confirmed",
        sessionToken: null,
        accessToken: crypto.randomUUID(),
        expiresAt,
        formExpiresAt,
        demoExpiresAt,
      })

      const bookingId = String(booking._id)
      const meetingLink = buildGoogleMeetLink(bookingId)
      await Booking.updateOne({ _id: booking._id }, { $set: { googleMeetLink: meetingLink } })
      booking.googleMeetLink = meetingLink

      const contact = await Contact.create({
        nombre: customerEmail,
        email: customerEmail,
        telefono: "-",
        clinica: "Creada desde panel",
        mensaje: "Cita creada manualmente desde el panel de administración.",
        bookingId: booking._id,
        sessionToken: null,
        roi: null,
      })

      const dateLabel = start.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
      const htmlContent = leadSummaryEmail({
        brandName,
        nombre: contact.nombre,
        email: contact.email,
        telefono: contact.telefono,
        clinica: contact.clinica,
        mensaje: contact.mensaje,
        supportEmail,
        booking: {
          dateLabel,
          timeLabel: parsed.time,
          duration: parsed.duration,
          meetingLink,
        },
        roi: contact.roi ?? null,
      })
      const attachments = [
        {
          name: "clinvetia-demo.ics",
          content: Buffer.from(
            buildICS({
              uid: bookingId,
              start,
              end,
              summary: "Demo Clinvetia",
              description: `Demo personalizada con Clinvetia. Enlace Google Meet: ${meetingLink}`,
              location: meetingLink,
              url: meetingLink,
              organizerEmail: supportEmail,
              attendeeEmail: customerEmail,
            })
          ).toString("base64"),
          contentType: "text/calendar",
        },
      ]
      const deliveryTargets = buildCreateBookingDeliveryTargets(customerEmail)

      for (const target of deliveryTargets) {
        const result = await sendBrevoEmail({
          to: [{ email: target, name: target === contact.email ? contact.nombre : brandName }],
          subject: "Tu demo está confirmada",
          htmlContent,
          attachments,
          replyTo: { email: supportEmail },
        })

        await appendBookingEmailEvent({
          bookingId,
          category: "booking_confirmed",
          subject: "Tu demo está confirmada",
          intendedRecipient: contact.email,
          deliveredTo: target,
          status: result.ok ? "sent" : "failed",
          error: result.error ?? null,
          message: contact.mensaje,
          googleMeetLink: meetingLink,
        })
      }
      await normalizeHistoricalBookingsByEmail(customerEmail, bookingId)

      try {
        await recordAdminAudit({
          adminId: auth.data.admin.id,
          action: "CREATE_BOOKING",
          targetType: "booking",
          targetId: bookingId,
          metadata: {
            status: booking.status,
            time: booking.time,
            date: booking.date.toISOString(),
            duration: booking.duration,
            action: parsed.action,
            email: contact.email,
          },
        })
      } catch (auditError) {
        console.error("Admin audit failed while creating booking", auditError)
      }

      return NextResponse.json({
        ok: true,
        booking: {
          id: bookingId,
          status: booking.status,
          date: booking.date.toISOString(),
          time: booking.time,
          duration: booking.duration,
          googleMeetLink: meetingLink,
        },
      })
    }
    const booking = await Booking.findById(parsed.id)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const rawContact = await Contact.findOne({ bookingId: { $in: [booking._id, String(booking._id)] } }).lean()
    const contact = Array.isArray(rawContact) ? rawContact[0] : rawContact
    const supportEmail = process.env.BREVO_REPLY_TO || "info@clinvetia.com"
    const brandName = "Clinvetia"
    const bookingId = String(booking._id)
    const meetingLink = booking.googleMeetLink || buildGoogleMeetLink(bookingId)

    const deleteCancelsBooking = parsed.action === "delete" && !["cancelled", "expired"].includes(booking.status)

    if (parsed.action === "delete") {
      if (deleteCancelsBooking) {
        await Booking.updateOne({ _id: booking._id }, { $set: { status: "cancelled" } })
        booking.status = "cancelled"

        if (contact?.email) {
          const [hour, min] = booking.time.split(":").map(Number)
          const start = new Date(booking.date)
          start.setHours(hour, min, 0, 0)
          const end = new Date(start)
          end.setMinutes(end.getMinutes() + booking.duration)
          const dateLabel = start.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
          const subject = "Tu demo ha sido cancelada"
          const htmlContent = leadSummaryEmail({
            brandName,
            nombre: contact.nombre,
            email: contact.email,
            telefono: contact.telefono,
            clinica: contact.clinica,
            mensaje: contact.mensaje,
            supportEmail,
            booking: {
              dateLabel,
              timeLabel: booking.time,
              duration: booking.duration,
              meetingLink,
            },
            roi: contact.roi ?? null,
          })
          const attachments = [
            {
              name: "clinvetia-demo.ics",
              content: Buffer.from(
                buildICS({
                  uid: bookingId,
                  start,
                  end,
                  summary: "Demo Clinvetia",
                  description: `Demo personalizada con Clinvetia. Enlace Google Meet: ${meetingLink}`,
                  location: meetingLink,
                  url: meetingLink,
                  organizerEmail: supportEmail,
                  attendeeEmail: contact.email,
                })
              ).toString("base64"),
              contentType: "text/calendar",
            },
          ]
          const deliveryTargets = buildCreateBookingDeliveryTargets(contact.email)

          for (const target of deliveryTargets) {
            const result = await sendBrevoEmail({
              to: [{ email: target, name: target === contact.email ? contact.nombre : brandName }],
              subject,
              htmlContent,
              attachments,
              replyTo: { email: supportEmail },
            })

            await appendBookingEmailEvent({
              bookingId,
              category: "booking_cancelled",
              subject,
              intendedRecipient: contact.email,
              deliveredTo: target,
              status: result.ok ? "sent" : "failed",
              error: result.error ?? null,
              message: contact.mensaje,
              googleMeetLink: meetingLink,
            })
          }
        }
      }

      await clearRoiForBookingContext({
        bookingId,
        bookingSessionToken: booking.sessionToken ?? null,
        contactSessionToken: contact?.sessionToken ? String(contact.sessionToken) : null,
      })
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
        const bookingSummary = {
          dateLabel,
          timeLabel,
          duration: booking.duration,
          meetingLink,
        }
        const htmlContent = leadSummaryEmail({
          brandName,
          nombre: contact.nombre,
          email: contact.email,
          telefono: contact.telefono,
          clinica: contact.clinica,
          mensaje: contact.mensaje,
          supportEmail,
          booking: bookingSummary,
          roi: contact.roi ?? null,
        })

        const attachments =
          parsed.status === "confirmed" || parsed.status === "cancelled"
            ? [
                {
                  name: "clinvetia-demo.ics",
                  content: Buffer.from(
                    buildICS({
                      uid: bookingId,
                      start,
                      end,
                      summary: "Demo Clinvetia",
                      description: `Demo personalizada con Clinvetia. Enlace Google Meet: ${meetingLink}`,
                      location: meetingLink,
                      url: meetingLink,
                      organizerEmail: supportEmail,
                      attendeeEmail: contact.email,
                    })
                  ).toString("base64"),
                  contentType: "text/calendar",
                },
              ]
            : undefined

        const deliveryTargets = buildCreateBookingDeliveryTargets(contact.email)
        for (const target of deliveryTargets) {
          const result = await sendBrevoEmail({
            to: [{ email: target, name: target === contact.email ? contact.nombre : brandName }],
            subject,
            htmlContent,
            attachments,
            replyTo: { email: supportEmail },
          })

          await appendBookingEmailEvent({
            bookingId,
            category: parsed.status === "cancelled" ? "booking_cancelled" : "booking_confirmed",
            subject,
            intendedRecipient: contact.email,
            deliveredTo: target,
            status: result.ok ? "sent" : "failed",
            error: result.error ?? null,
            message: contact.mensaje,
            googleMeetLink: meetingLink,
          })
        }
      }

      if (parsed.status === "cancelled" || parsed.status === "expired") {
        await clearRoiForBookingContext({
          bookingId,
          bookingSessionToken: booking.sessionToken ?? null,
          contactSessionToken: contact?.sessionToken ? String(contact.sessionToken) : null,
        })
      }
    } else {
      if (!isValidDemoTimeSlot(parsed.time) || !isBookableDemoTimeSlot(parsed.time)) {
        return NextResponse.json({ error: "Slot unavailable" }, { status: 409 })
      }

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
      const nextMeetingLink = buildGoogleMeetLink(`${bookingId}-${crypto.randomUUID()}`)

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
            googleMeetLink: nextMeetingLink,
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
      booking.googleMeetLink = nextMeetingLink

      if (!contact?.email) {
        return NextResponse.json(
          { error: "La cita no tiene un correo asociado para enviar el reagendado." },
          { status: 409 }
        )
      }

      if (contact?.email) {
        const start = new Date(date)
        start.setHours(hour, min, 0, 0)
        const end = new Date(start)
        end.setMinutes(end.getMinutes() + parsed.duration)
        const dateLabel = start.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
        const timeLabel = parsed.time

        const ics = buildICS({
          uid: bookingId,
          start,
          end,
          summary: "Demo Clinvetia (reagendada)",
          description: `Demo personalizada con Clinvetia - cita reagendada. Enlace Google Meet: ${nextMeetingLink}`,
          location: nextMeetingLink,
          url: nextMeetingLink,
          organizerEmail: supportEmail,
          attendeeEmail: contact.email,
        })

        const subject = "Tu demo ha sido reagendada"
        const htmlContent = leadSummaryEmail({
          brandName,
          nombre: contact.nombre,
          email: contact.email,
          telefono: contact.telefono,
          clinica: contact.clinica,
          mensaje: contact.mensaje,
          supportEmail,
          booking: { dateLabel, timeLabel, duration: parsed.duration, meetingLink: nextMeetingLink },
          roi: contact.roi ?? null,
        })
        const attachments = [
          {
            name: "clinvetia-demo-reagendada.ics",
            content: Buffer.from(ics).toString("base64"),
            contentType: "text/calendar",
          },
        ]
        const deliveryTargets = buildCreateBookingDeliveryTargets(contact.email)
        for (const target of deliveryTargets) {
          const result = await sendBrevoEmail({
            to: [{ email: target, name: target === contact.email ? contact.nombre : brandName }],
            subject,
            htmlContent,
            attachments,
            replyTo: { email: supportEmail },
          })

          await appendBookingEmailEvent({
            bookingId,
            category: "booking_rescheduled",
            subject,
            intendedRecipient: contact.email,
            deliveredTo: target,
            status: result.ok ? "sent" : "failed",
            error: result.error ?? null,
            message: contact.mensaje,
            googleMeetLink: nextMeetingLink,
          })
        }
        await normalizeHistoricalBookingsByEmail(contact.email, bookingId)
      }
    }

    const auditAction =
      parsed.action === "delete"
        ? "DELETE_BOOKING"
        : parsed.action === "reschedule"
          ? "RESCHEDULE_BOOKING"
          : parsed.status === "confirmed"
            ? "ACCEPT_BOOKING"
            : parsed.status === "cancelled"
              ? "CANCEL_BOOKING"
              : "UPDATE_BOOKING_STATUS"

    try {
      await recordAdminAudit({
        adminId: auth.data.admin.id,
        action: auditAction,
        targetType: "booking",
        targetId: parsed.id,
        metadata: {
          status: booking.status,
          time: booking.time,
          date: booking.date.toISOString(),
          duration: booking.duration,
          action: parsed.action,
          deleteMode: parsed.action === "delete" ? (deleteCancelsBooking ? "cancel-and-delete" : "hard-delete") : undefined,
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
