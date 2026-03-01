import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-auth"
import { recordAdminAudit } from "@/lib/admin-audit"
import { sendBrevoEmail } from "@/lib/brevo"
import { customerReplyEmail } from "@/lib/emails"
import { dbConnect } from "@/lib/db"
import { Contact } from "@/models/Contact"
import { Booking } from "@/models/Booking"
import { AdminMailboxMessage } from "@/models/AdminMailboxMessage"
import { buildICS } from "@/lib/ics"
import {
  appendBookingEmailEvent,
  buildGoogleMeetLink,
} from "@/lib/booking-communication"
import { canUseSharedMailbox, getSharedMailboxEmail } from "@/lib/admin-mailbox"

const schema = z.object({
  mailbox: z.enum(["self", "shared"]).default("shared"),
  to: z.string().email(),
  customerName: z.string().trim().min(1).max(80).optional(),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
})

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (auth.data.admin.role === "demo") {
    return NextResponse.json({ error: "Modo demo sin envío de correos" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const parsed = schema.parse(body)
    const canAccessShared = canUseSharedMailbox(auth.data.admin.role)
    if (parsed.mailbox === "shared" && !canAccessShared) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await dbConnect()
    const sharedMailbox = getSharedMailboxEmail()
    const ownMailbox = auth.data.admin.email.trim().toLowerCase()
    const selectedMailbox = parsed.mailbox === "shared" ? sharedMailbox : ownMailbox
    const supportEmail =
      process.env.BREVO_REPLY_TO || process.env.BREVO_SENDER_EMAIL || selectedMailbox
    const brandName = process.env.BREVO_SENDER_NAME || "Clinvetia"
    const rawContactDoc = await Contact.findOne({ email: parsed.to }).sort({ createdAt: -1 }).lean()
    const rawContact = Array.isArray(rawContactDoc) ? rawContactDoc[0] : rawContactDoc
    const bookingId =
      rawContact &&
      typeof rawContact === "object" &&
      "bookingId" in rawContact &&
      (rawContact as { bookingId?: unknown }).bookingId
        ? String((rawContact as { bookingId?: unknown }).bookingId)
        : null
    const rawBookingDoc = bookingId ? await Booking.findById(bookingId).lean() : null
    const booking = Array.isArray(rawBookingDoc) ? rawBookingDoc[0] : rawBookingDoc
    const bookingData =
      booking && typeof booking === "object"
        ? (booking as {
            googleMeetLink?: string
            time?: string
            date?: string | Date
            duration?: number | string
          })
        : null
    const meetingLink = bookingId ? bookingData?.googleMeetLink || buildGoogleMeetLink(bookingId) : null

    const attachments =
      bookingData && meetingLink
        ? (() => {
            const [hour, min] = String(bookingData.time ?? "").split(":").map(Number)
            const start = new Date(bookingData.date ?? Date.now())
            start.setHours(hour, min, 0, 0)
            const end = new Date(start)
            end.setMinutes(end.getMinutes() + Number(bookingData.duration || 30))
            const ics = buildICS({
              uid: bookingId || crypto.randomUUID(),
              start,
              end,
              summary: "Seguimiento Clinvetia",
              description: `Seguimiento de tu solicitud en Clinvetia. Enlace Google Meet: ${meetingLink}`,
              location: meetingLink,
              url: meetingLink,
              organizerEmail: supportEmail,
              attendeeEmail: parsed.to,
            })
            return [
              {
                name: "clinvetia-seguimiento.ics",
                content: Buffer.from(ics).toString("base64"),
                contentType: "text/calendar",
              },
            ]
          })()
        : undefined

    const result = await sendBrevoEmail({
      to: [{ email: parsed.to, name: parsed.customerName || parsed.to }],
      subject: parsed.subject,
      htmlContent: customerReplyEmail({
        brandName,
        customerName: parsed.customerName || parsed.to,
        customerEmail: parsed.to,
        supportEmail: selectedMailbox,
        subject: parsed.subject,
        message: parsed.message,
        meetingLink,
      }),
      attachments,
      replyTo: { email: selectedMailbox, name: brandName },
    })

    const preview = parsed.message.replace(/\s+/g, " ").trim().slice(0, 180)
    const docs: Array<Record<string, unknown>> = [
      {
        mailboxType: "user",
        mailboxEmail: ownMailbox,
        folder: "sent",
        direction: "outbound",
        status: result.ok ? "sent" : "failed",
        from: { email: selectedMailbox, name: auth.data.admin.name },
        to: [{ email: parsed.to, name: parsed.customerName || null }],
        subject: parsed.subject,
        body: parsed.message,
        preview,
        error: result.error || null,
        relatedType: bookingId ? "booking" : "contact",
        relatedId: bookingId || parsed.to,
        createdBy: {
          adminId: auth.data.admin.id,
          email: auth.data.admin.email,
          name: auth.data.admin.name,
          role: auth.data.admin.role,
        },
      },
    ]
    if (parsed.mailbox === "shared") {
      docs.push({
        mailboxType: "shared",
        mailboxEmail: sharedMailbox,
        folder: "sent",
        direction: "outbound",
        status: result.ok ? "sent" : "failed",
        from: { email: sharedMailbox, name: auth.data.admin.name },
        to: [{ email: parsed.to, name: parsed.customerName || null }],
        subject: parsed.subject,
        body: parsed.message,
        preview,
        error: result.error || null,
        relatedType: bookingId ? "booking" : "contact",
        relatedId: bookingId || parsed.to,
        createdBy: {
          adminId: auth.data.admin.id,
          email: auth.data.admin.email,
          name: auth.data.admin.name,
          role: auth.data.admin.role,
        },
      })
    }
    await AdminMailboxMessage.insertMany(docs)

    if (bookingId) {
      await appendBookingEmailEvent({
        bookingId,
        category: "customer_custom_reply",
        subject: parsed.subject,
        intendedRecipient: parsed.to,
        deliveredTo: parsed.to,
        status: result.ok ? "sent" : "failed",
        error: result.error ?? null,
        message: parsed.message,
        googleMeetLink: meetingLink,
      })
    }

    if (!result.ok) {
      console.error("Brevo customer email delivery failed", {
        to: parsed.to,
        subject: parsed.subject,
        error: result.error,
      })
      return NextResponse.json({ error: result.error || "No se pudo enviar el correo" }, { status: 502 })
    }

    await recordAdminAudit({
      adminId: auth.data.admin.id,
      action: "SEND_CUSTOMER_EMAIL",
      targetType: "contact",
      targetId: parsed.to,
      metadata: {
        to: parsed.to,
        subject: parsed.subject,
        mailbox: parsed.mailbox,
        by: auth.data.admin.email,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
