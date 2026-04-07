import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { Booking } from "@/models/Booking"
import { Contact } from "@/models/Contact"
import { Session } from "@/models/Session"
import { verifyRecaptchaToken } from "@/lib/recaptcha-server"
import { isBookableDemoTimeSlot, isValidDemoTimeSlot } from "@/lib/demo-schedule"
import { sendBrevoEmail } from "@/lib/brevo"
import { buildGoogleMeetLink } from "@/lib/booking-communication"
import { appendBookingEmailEvent } from "@/lib/booking-communication"
import { leadSummaryEmail } from "@/lib/emails"
import { buildICS } from "@/lib/ics"
import { rescheduleExistingBooking } from "@/lib/booking-reschedule"
import { formatBookingDate } from "@/lib/booking-date"

interface BookingLeanView {
  _id: { toString(): string }
  date: Date
  time: string
  duration: number
  status: "pending" | "confirmed" | "expired" | "cancelled" | "rescheduled"
  sessionToken?: string | null
  operatorEmail?: string | null
  rescheduledFromBookingId?: { toString(): string } | string | null
  rescheduledToBookingId?: { toString(): string } | string | null
  accessToken: string
  expiresAt: Date
  formExpiresAt: Date
  demoExpiresAt: Date
  googleMeetLink?: string | null
  googleCalendarEventId?: string | null
  googleCalendarHtmlLink?: string | null
  conversationSummary?: string | null
  conversationMessages?: Array<{
    role: "assistant" | "user"
    content: string
    timestamp?: Date | string
  }>
}

interface ContactLeanView {
  _id: { toString(): string }
  nombre?: string
  email?: string
  telefono?: string
  clinica?: string
  mensaje?: string
  roi?: unknown
  createdAt?: Date | string
}

interface SessionConversationLeanView {
  chatSummary?: string | null
  chatHistory?: Array<{
    role: "assistant" | "user"
    content: string
    timestamp?: Date | string
  }>
}

type SessionConversationMessage = NonNullable<SessionConversationLeanView["chatHistory"]>[number]
type BookingConversationMessage = NonNullable<BookingLeanView["conversationMessages"]>[number]

const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duration: z.number().int().min(15).max(120),
  sessionToken: z.string().optional().nullable(),
  recaptchaToken: z.string().min(10),
})

const bookingRescheduleSchema = z.object({
  bookingId: z.string().min(1),
  accessToken: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
})

async function buildBookingConversationSnapshot(sessionToken?: string | null) {
  if (!sessionToken) {
    return {
      conversationSummary: "",
      conversationMessages: [],
    }
  }

  const rawSession = await Session.findOne({ token: sessionToken })
    .select("chatSummary chatHistory")
    .lean<SessionConversationLeanView | null>()
  const session = Array.isArray(rawSession) ? rawSession[0] : rawSession
  const conversationMessages = Array.isArray(session?.chatHistory)
    ? (session.chatHistory
        .map((message: SessionConversationMessage) => ({
          role: message.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: String(message.content || "").replace(/\s+/g, " ").trim().slice(0, 400),
          timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
        }))
        .filter((message: BookingConversationMessage) => message.content.length > 0)
        .slice(-24))
    : []
  const conversationSummary = String(session?.chatSummary || "").replace(/\s+/g, " ").trim().slice(0, 1800)

  if (!conversationSummary && conversationMessages.length === 0) {
    return {
      conversationSummary: "",
      conversationMessages: [],
    }
  }

  return {
    conversationSummary,
    conversationMessages,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = bookingSchema.parse(body)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
    const recaptcha = await verifyRecaptchaToken({
      token: parsed.recaptchaToken,
      action: "booking_create",
      minScore: 0.45,
      ip,
    })
    if (!recaptcha.ok) {
      return NextResponse.json({ error: recaptcha.reason || "reCAPTCHA validation failed" }, { status: 400 })
    }

    await dbConnect()

    const existingContact = parsed.sessionToken
      ? await Contact.findOne({ sessionToken: parsed.sessionToken }).select("_id").lean()
      : null
    const isRegisteredClient = Boolean(existingContact)
    if (!isRegisteredClient && parsed.duration !== 30) {
      return NextResponse.json(
        { error: "Para nuevos clientes, la demo disponible es de 30 minutos." },
        { status: 403 }
      )
    }

    if (!isValidDemoTimeSlot(parsed.time) || !isBookableDemoTimeSlot(parsed.time)) {
      return NextResponse.json(
        { error: "Slot unavailable" },
        { status: 409 }
      )
    }

    const date = new Date(`${parsed.date}T00:00:00.000Z`)
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    const [hour, min] = parsed.time.split(":").map(Number)
    const demoDateTime = new Date(date)
    demoDateTime.setHours(hour, min, 0, 0)

    const demoExpiresAt = new Date(demoDateTime)
    demoExpiresAt.setMinutes(demoExpiresAt.getMinutes() + parsed.duration)

    const expiresAt = new Date(date)
    expiresAt.setHours(23, 59, 59, 999)

    const formExpiresAt = new Date()
    formExpiresAt.setMinutes(formExpiresAt.getMinutes() + 10)

    const start = new Date(date)
    start.setHours(0, 0, 0, 0)

    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    if (parsed.sessionToken) {
      const rawActiveBooking = await Booking.findOne({
        sessionToken: parsed.sessionToken,
        demoExpiresAt: { $gt: new Date() },
        status: { $in: ["pending", "confirmed"] },
      }).lean<BookingLeanView>()
      const activeBooking = Array.isArray(rawActiveBooking) ? rawActiveBooking[0] : rawActiveBooking

      if (activeBooking) {
        return NextResponse.json(
          {
            error: "Ya tienes una demo reservada activa. Gestiona cambios desde el correo de confirmacion.",
            bookingId: activeBooking._id.toString(),
            demoExpiresAt: activeBooking.demoExpiresAt.toISOString(),
          },
          { status: 409 }
        )
      }
    }

    const rawConflict = await Booking.findOne({
      date: { $gte: start, $lte: end },
      time: parsed.time,
      status: "confirmed",
    }).lean<BookingLeanView>()
    const conflict = Array.isArray(rawConflict) ? rawConflict[0] : rawConflict

    if (conflict) {
      return NextResponse.json({ error: "Slot unavailable" }, { status: 409 })
    }

    const accessToken = crypto.randomUUID()

    const conversationSnapshot = await buildBookingConversationSnapshot(parsed.sessionToken ?? null)

    const booking = new Booking({
      date,
      time: parsed.time,
      duration: parsed.duration,
      sessionToken: parsed.sessionToken ?? null,
      accessToken,
      expiresAt,
      formExpiresAt,
      demoExpiresAt,
      status: "confirmed",
      ...conversationSnapshot,
    })
    booking.googleMeetLink = buildGoogleMeetLink(booking._id.toString())
    await booking.save()

    return NextResponse.json({
      bookingId: booking._id.toString(),
      accessToken,
      date: booking.date.toISOString(),
      time: booking.time,
      duration: booking.duration,
      expiresAt: booking.expiresAt.toISOString(),
      formExpiresAt: booking.formExpiresAt.toISOString(),
      demoExpiresAt: booking.demoExpiresAt.toISOString(),
      googleMeetLink: booking.googleMeetLink,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get("bookingId")
    const token = req.headers.get("x-booking-token") || searchParams.get("token")
    const sessionToken = req.headers.get("x-session-token") || searchParams.get("sessionToken")

    await dbConnect()

    if (sessionToken && (!bookingId || !token)) {
      const rawActiveBooking = await Booking.findOne({
        sessionToken,
        demoExpiresAt: { $gt: new Date() },
        status: { $in: ["pending", "confirmed"] },
      })
        .sort({ createdAt: -1 })
        .lean<BookingLeanView>()
      const activeBooking = Array.isArray(rawActiveBooking) ? rawActiveBooking[0] : rawActiveBooking

      if (!activeBooking) {
        return NextResponse.json({ active: false })
      }

      const existingContact =
        (await Contact.findOne({ bookingId: { $in: [activeBooking._id, activeBooking._id.toString()] } })
          .select("nombre email telefono clinica mensaje roi createdAt")
          .lean<ContactLeanView>()) ||
        (activeBooking.sessionToken
          ? await Contact.findOne({ sessionToken: activeBooking.sessionToken })
              .sort({ createdAt: -1 })
              .select("nombre email telefono clinica mensaje roi createdAt")
              .lean<ContactLeanView>()
          : null)

      return NextResponse.json({
        active: true,
        bookingId: activeBooking._id.toString(),
        accessToken: activeBooking.accessToken,
        date: activeBooking.date.toISOString(),
        time: activeBooking.time,
        duration: activeBooking.duration,
        expiresAt: activeBooking.expiresAt.toISOString(),
        formExpiresAt: activeBooking.formExpiresAt.toISOString(),
        demoExpiresAt: activeBooking.demoExpiresAt.toISOString(),
        googleMeetLink: activeBooking.googleMeetLink || buildGoogleMeetLink(activeBooking._id.toString()),
        status: activeBooking.status,
        contactSubmitted: Boolean(existingContact),
        contact: existingContact
          ? {
              nombre: existingContact.nombre,
              email: existingContact.email,
              telefono: existingContact.telefono,
              clinica: existingContact.clinica,
              mensaje: existingContact.mensaje,
              roi: existingContact.roi ?? null,
              createdAt: existingContact.createdAt ? new Date(existingContact.createdAt).toISOString() : null,
            }
          : null,
      })
    }

    if (!bookingId || !token) {
      return NextResponse.json({ error: "Missing bookingId/token or sessionToken" }, { status: 400 })
    }

    const rawBooking = await Booking.findById(bookingId).lean<BookingLeanView>()
    const booking = Array.isArray(rawBooking) ? rawBooking[0] : rawBooking

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.accessToken !== token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const existingContact =
      (await Contact.findOne({ bookingId: { $in: [booking._id, booking._id.toString()] } })
        .select("nombre email telefono clinica mensaje roi createdAt")
        .lean<ContactLeanView>()) ||
      (booking.sessionToken
        ? await Contact.findOne({ sessionToken: booking.sessionToken })
            .sort({ createdAt: -1 })
            .select("nombre email telefono clinica mensaje roi createdAt")
            .lean<ContactLeanView>()
        : null)

    return NextResponse.json({
      bookingId: booking._id.toString(),
      date: booking.date.toISOString(),
      time: booking.time,
      duration: booking.duration,
      expiresAt: booking.expiresAt.toISOString(),
      formExpiresAt: booking.formExpiresAt.toISOString(),
      demoExpiresAt: booking.demoExpiresAt.toISOString(),
      googleMeetLink: booking.googleMeetLink || buildGoogleMeetLink(booking._id.toString()),
      status: booking.status,
      contactSubmitted: Boolean(existingContact),
      contact: existingContact
        ? {
            nombre: existingContact.nombre,
            email: existingContact.email,
            telefono: existingContact.telefono,
            clinica: existingContact.clinica,
            mensaje: existingContact.mensaje,
            roi: existingContact.roi ?? null,
            createdAt: existingContact.createdAt ? new Date(existingContact.createdAt).toISOString() : null,
          }
        : null,
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const parsed = bookingRescheduleSchema.parse(body)

    await dbConnect()

    const rawBooking = await Booking.findById(parsed.bookingId).lean<BookingLeanView>()
    const booking = Array.isArray(rawBooking) ? rawBooking[0] : rawBooking

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.accessToken !== parsed.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!["pending", "confirmed"].includes(booking.status) || new Date(booking.demoExpiresAt).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Booking is no longer active" }, { status: 409 })
    }

    if (!isValidDemoTimeSlot(parsed.time) || !isBookableDemoTimeSlot(parsed.time)) {
      return NextResponse.json({ error: "Slot unavailable" }, { status: 409 })
    }

    const date = new Date(`${parsed.date}T00:00:00.000Z`)
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    const rescheduled = await rescheduleExistingBooking({
      bookingId: parsed.bookingId,
      date,
      time: parsed.time,
      duration: booking.duration,
    })

    if (!rescheduled.ok) {
      return NextResponse.json(
        { error: rescheduled.reason === "booking_not_found" ? "Booking not found" : "Slot unavailable" },
        { status: rescheduled.reason === "booking_not_found" ? 404 : 409 },
      )
    }

    const nextBooking = rescheduled.booking
    const [hour, min] = parsed.time.split(":").map(Number)
    const start = new Date(nextBooking.date)
    start.setUTCHours(hour, min, 0, 0)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + nextBooking.duration)

    const contact =
      rescheduled.contact ||
      (await Contact.findOne({ bookingId: { $in: [nextBooking.id, String(nextBooking.id)] } })
        .sort({ createdAt: -1 })
        .lean<ContactLeanView | null>())

    if (contact?.email) {
      const supportEmail = process.env.BREVO_REPLY_TO || "info@clinvetia.com"
      const dateLabel = formatBookingDate(nextBooking.date, "es-ES", { weekday: "long", day: "numeric", month: "long" })
      const subject = "Tu demo ha sido reagendada"
      const htmlContent = leadSummaryEmail({
        brandName: "Clinvetia",
        nombre: contact.nombre || "Cliente",
        email: contact.email || "",
        telefono: contact.telefono || "",
        clinica: contact.clinica || "",
        mensaje: contact.mensaje || "Cita reagendada desde el área de reservas.",
        supportEmail,
        booking: {
          dateLabel,
          timeLabel: nextBooking.time,
          duration: nextBooking.duration,
          meetingLink: nextBooking.googleMeetLink,
        },
        roi: contact.roi ?? null,
      })
      const ics = buildICS({
        uid: nextBooking.id,
        start,
        end,
        summary: "Demo Clinvetia (reagendada)",
        description: `Demo personalizada con Clinvetia - cita reagendada desde ${rescheduled.previousBookingId}. Enlace Google Meet: ${nextBooking.googleMeetLink}`,
        location: nextBooking.googleMeetLink,
        url: nextBooking.googleMeetLink,
        timeZone: "Europe/Madrid",
        organizerEmail: supportEmail,
        attendeeEmail: contact.email,
      })
      const deliveryTargets = Array.from(
        new Set(
          [contact.email, supportEmail, nextBooking.operatorEmail].filter(
            (value): value is string => Boolean(value)
          )
        )
      )

      for (const target of deliveryTargets) {
        const result = await sendBrevoEmail({
          to: [{ email: target, name: target === contact.email ? contact.nombre || "Cliente" : "Clinvetia" }],
          subject,
          htmlContent,
          attachments: [{
            name: "clinvetia-demo-reagendada.ics",
            content: Buffer.from(ics).toString("base64"),
            contentType: "text/calendar",
          }],
          replyTo: { email: supportEmail },
        })

        await appendBookingEmailEvent({
          bookingId: nextBooking.id,
          category: "booking_rescheduled",
          subject,
          intendedRecipient: contact.email ?? null,
          deliveredTo: target,
          status: result.ok ? "sent" : "failed",
          error: result.error ?? null,
          message: contact.mensaje || "Cita reagendada desde el área de reservas.",
          googleMeetLink: nextBooking.googleMeetLink,
        })
      }
    }

    return NextResponse.json({
      bookingId: nextBooking.id,
      accessToken: nextBooking.accessToken,
      date: nextBooking.date.toISOString(),
      time: nextBooking.time,
      duration: nextBooking.duration,
      expiresAt: nextBooking.expiresAt.toISOString(),
      formExpiresAt: nextBooking.formExpiresAt.toISOString(),
      demoExpiresAt: nextBooking.demoExpiresAt.toISOString(),
      googleMeetLink: nextBooking.googleMeetLink,
      status: "confirmed",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
