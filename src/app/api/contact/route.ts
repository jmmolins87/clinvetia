import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { Booking } from "@/models/Booking"
import { Contact } from "@/models/Contact"
import { Session } from "@/models/Session"
import { AdminMailboxMessage } from "@/models/AdminMailboxMessage"
import { sendBrevoEmail } from "@/lib/brevo"
import {
  leadSummaryEmail,
} from "@/lib/emails"
import { buildICS } from "@/lib/ics"
import {
  appendBookingEmailEvent,
  buildGoogleMeetLink,
} from "@/lib/booking-communication"
import { getSharedMailboxEmail } from "@/lib/admin-mailbox"
import { verifyRecaptchaToken } from "@/lib/recaptcha-server"

interface SessionLeanView {
  _id: { toString(): string }
  token: string
  expiresAt: Date | string
}

interface ContactExistsLeanView {
  _id: { toString(): string }
}

function isBrevoNotConfigured(result: { ok: boolean; error?: string } | null | undefined) {
  return Boolean(result && !result.ok && result.error === "Brevo not configured")
}

const contactSchema = z.object({
  nombre: z.string().min(3).max(50),
  email: z.string().email().max(100),
  telefono: z.string().min(9).max(15),
  clinica: z.string().min(2).max(60),
  mensaje: z.string().min(10).max(500),
  recaptchaToken: z.string().min(10),
  bookingId: z.string().optional(),
  accessToken: z.string().optional(),
  roi: z
    .object({
      monthlyPatients: z.number().optional(),
      averageTicket: z.number().optional(),
      conversionLoss: z.number().optional(),
      roi: z.number().optional(),
    })
    .optional(),
  sessionToken: z.string().optional().nullable(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = contactSchema.parse(body)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
    const recaptcha = await verifyRecaptchaToken({
      token: parsed.recaptchaToken,
      action: "contact_submit",
      minScore: 0.45,
      ip,
    })
    if (!recaptcha.ok) {
      return NextResponse.json({ error: recaptcha.reason || "reCAPTCHA validation failed" }, { status: 400 })
    }

    await dbConnect()

    let bookingId: string | null = null
    let bookingForEmail: { date: Date; time: string; duration: number } | null = null

    if (parsed.bookingId) {
      if (!parsed.accessToken) {
        return NextResponse.json({ error: "Missing access token" }, { status: 400 })
      }

      const booking = await Booking.findById(parsed.bookingId)

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }

      if (booking.accessToken !== parsed.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      const rawExistingContact = await Contact.findOne({ bookingId: booking._id }).lean<ContactExistsLeanView>()
      const existingContact = Array.isArray(rawExistingContact) ? rawExistingContact[0] : rawExistingContact
      if (existingContact && new Date(booking.demoExpiresAt).getTime() > Date.now()) {
        return NextResponse.json(
          { error: "Ya hemos recibido tus datos para esta demo. Gestiona cambios desde el correo de confirmacion." },
          { status: 409 }
        )
      }

      if (new Date(booking.formExpiresAt).getTime() < Date.now()) {
        return NextResponse.json({ error: "Booking form expired" }, { status: 410 })
      }

      bookingId = booking._id.toString()
      bookingForEmail = { date: booking.date, time: booking.time, duration: booking.duration }
    } else if (parsed.sessionToken) {
      const rawSession = await Session.findOne({ token: parsed.sessionToken }).lean<SessionLeanView>()
      const session = Array.isArray(rawSession) ? rawSession[0] : rawSession
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        return NextResponse.json({ error: "Session expired" }, { status: 410 })
      }
    } else {
      return NextResponse.json({ error: "Missing booking or session" }, { status: 400 })
    }

    const createdContact = await Contact.create({
      nombre: parsed.nombre,
      email: parsed.email,
      telefono: parsed.telefono,
      clinica: parsed.clinica,
      mensaje: parsed.mensaje,
      bookingId,
      sessionToken: parsed.sessionToken ?? null,
      roi: parsed.roi ?? {},
    })

    await AdminMailboxMessage.create({
      mailboxType: "shared",
      mailboxEmail: getSharedMailboxEmail(),
      folder: "inbox",
      direction: "inbound",
      status: "received",
      from: { email: parsed.email, name: parsed.nombre },
      to: [{ email: getSharedMailboxEmail(), name: "Clinvetia" }],
      subject: bookingForEmail ? "Nuevo lead con reserva demo" : "Nuevo lead de contacto",
      body: parsed.mensaje,
      preview: parsed.mensaje.replace(/\s+/g, " ").trim().slice(0, 180),
      relatedType: bookingId ? "booking" : "contact",
      relatedId: bookingId || createdContact._id.toString(),
      createdBy: {
        adminId: null,
        email: parsed.email,
        name: parsed.nombre,
        role: "external",
      },
    })

    const supportEmail = process.env.BREVO_REPLY_TO || "info@clinvetia.com"
    const brandName = "Clinvetia"

    let emailResult: { ok: boolean; error?: string } | null = null
    let internalEmailResult: { ok: boolean; error?: string } | null = null
    let bookingMeetingLink: string | null = null
    let bookingIcsAttachment:
      | {
          name: string
          content: string
          contentType: string
        }
      | null = null
    let bookingForInternal:
      | { dateLabel: string; timeLabel: string; duration: number }
      | null = null

    if (bookingForEmail) {
      const meetingLink = buildGoogleMeetLink(bookingId || crypto.randomUUID())
      bookingMeetingLink = meetingLink
      const [hour, min] = bookingForEmail.time.split(":").map(Number)
      const start = new Date(bookingForEmail.date)
      start.setHours(hour, min, 0, 0)
      const end = new Date(start)
      end.setMinutes(end.getMinutes() + bookingForEmail.duration)

      const dateLabel = start.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
      const timeLabel = bookingForEmail.time
      bookingForInternal = {
        dateLabel,
        timeLabel,
        duration: bookingForEmail.duration,
      }

      const ics = buildICS({
        uid: bookingId || crypto.randomUUID(),
        start,
        end,
        summary: "Demo Clinvetia",
        description: `Demo personalizada con Clinvetia. Enlace Google Meet: ${meetingLink}`,
        location: meetingLink,
        url: meetingLink,
        organizerEmail: supportEmail,
        attendeeEmail: parsed.email,
      })
      bookingIcsAttachment = {
        name: "clinvetia-demo.ics",
        content: Buffer.from(ics).toString("base64"),
        contentType: "text/calendar",
      }

      const subject = "Tu demo esta confirmada"
      const bookingSummary = bookingForInternal
        ? { ...bookingForInternal, meetingLink, bookingId: bookingId || undefined }
        : null
      const htmlContent = leadSummaryEmail({
        brandName,
        nombre: parsed.nombre,
        email: parsed.email,
        telefono: parsed.telefono,
        clinica: parsed.clinica,
        mensaje: parsed.mensaje,
        supportEmail,
        booking: bookingSummary,
        roi: parsed.roi ?? null,
      })

      emailResult = await sendBrevoEmail({
        to: [{ email: parsed.email, name: parsed.nombre }],
        subject,
        htmlContent,
        attachments: [
          bookingIcsAttachment,
        ],
        replyTo: { email: supportEmail },
      })

      if (bookingId) {
        await appendBookingEmailEvent({
          bookingId,
          category: "customer_summary",
          subject,
          intendedRecipient: parsed.email,
          deliveredTo: parsed.email,
          status: emailResult.ok ? "sent" : "failed",
          error: emailResult.error ?? null,
          message: parsed.mensaje,
          googleMeetLink: meetingLink,
        })
      }
    } else {
      const subject = "Resumen de tu solicitud"
      const htmlContent = leadSummaryEmail({
        brandName,
        nombre: parsed.nombre,
        email: parsed.email,
        telefono: parsed.telefono,
        clinica: parsed.clinica,
        mensaje: parsed.mensaje,
        supportEmail,
        booking: bookingForInternal,
        roi: parsed.roi ?? null,
      })

      emailResult = await sendBrevoEmail({
        to: [{ email: parsed.email, name: parsed.nombre }],
        subject,
        htmlContent,
        replyTo: { email: supportEmail },
      })
    }

    if (emailResult && !emailResult.ok) {
      console.error("Brevo email delivery failed", {
        hasBooking: Boolean(bookingForEmail),
        recipient: parsed.email,
        error: emailResult.error,
      })
      if (!isBrevoNotConfigured(emailResult)) {
        return NextResponse.json(
          { error: emailResult.error || "Email delivery failed" },
          { status: 502 }
        )
      }
    }

    if (supportEmail.toLowerCase() !== parsed.email.toLowerCase()) {
      internalEmailResult = await sendBrevoEmail({
        to: [{ email: supportEmail, name: brandName }],
        subject: bookingForEmail ? "Nuevo lead con reserva demo" : "Nuevo lead de contacto",
        htmlContent: leadSummaryEmail({
          supportEmail,
          brandName,
          nombre: parsed.nombre,
          email: parsed.email,
          telefono: parsed.telefono,
          clinica: parsed.clinica,
          mensaje: parsed.mensaje,
          booking: bookingForInternal ? { ...bookingForInternal, meetingLink: bookingMeetingLink || undefined } : null,
          roi: parsed.roi ?? null,
        }),
        attachments: bookingIcsAttachment ? [bookingIcsAttachment] : undefined,
        replyTo: { email: parsed.email, name: parsed.nombre },
      })
    } else {
      internalEmailResult = { ok: true }
    }

    if (bookingId && internalEmailResult) {
      await appendBookingEmailEvent({
        bookingId,
        category: "internal_notification",
        subject: bookingForEmail ? "Nuevo lead con reserva demo" : "Nuevo lead de contacto",
        intendedRecipient: supportEmail,
        deliveredTo: supportEmail,
        status: internalEmailResult.ok ? "sent" : "failed",
        error: internalEmailResult.error ?? null,
        message: parsed.mensaje,
      })
    }

    if (!internalEmailResult.ok) {
      console.error("Brevo internal email delivery failed", {
        recipient: supportEmail,
        leadEmail: parsed.email,
        error: internalEmailResult.error,
      })
      if (!isBrevoNotConfigured(internalEmailResult)) {
        return NextResponse.json(
          { error: internalEmailResult.error || "Internal email delivery failed" },
          { status: 502 }
        )
      }
    }

    return NextResponse.json({ ok: true, contactId: createdContact._id.toString() })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    console.error("Contact API error", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
