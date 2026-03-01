import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-auth"
import { dbConnect } from "@/lib/db"
import { sendBrevoEmail } from "@/lib/brevo"
import { customerReplyEmail } from "@/lib/emails"
import { AdminMailboxMessage } from "@/models/AdminMailboxMessage"
import { canUseSharedMailbox, getSharedMailboxEmail } from "@/lib/admin-mailbox"
import { recordAdminAudit } from "@/lib/admin-audit"
import { addDemoSentMail } from "@/lib/admin-demo-mail-state"

const schema = z.object({
  mailbox: z.enum(["self", "shared"]).default("self"),
  to: z.string().email(),
  customerName: z.string().trim().min(1).max(120).optional(),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
})

function buildPreview(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 180)
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const parsed = schema.parse(body)
    if (auth.data.admin.role === "demo") {
      addDemoSentMail({
        mailbox: parsed.mailbox,
        demoUserEmail: auth.data.admin.email.trim().toLowerCase(),
        to: parsed.to,
        customerName: parsed.customerName,
        subject: parsed.subject,
        body: parsed.message,
      })
      return NextResponse.json({ ok: true, demo: true })
    }
    const canAccessShared = canUseSharedMailbox(auth.data.admin.role)
    if (parsed.mailbox === "shared" && !canAccessShared) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await dbConnect()

    const selectedMailboxEmail =
      parsed.mailbox === "shared"
        ? getSharedMailboxEmail()
        : auth.data.admin.email.trim().toLowerCase()

    const supportEmail =
      process.env.BREVO_REPLY_TO || process.env.BREVO_SENDER_EMAIL || getSharedMailboxEmail()
    const brandName = process.env.BREVO_SENDER_NAME || "Clinvetia"

    const result = await sendBrevoEmail({
      to: [{ email: parsed.to, name: parsed.customerName || parsed.to }],
      subject: parsed.subject,
      htmlContent: customerReplyEmail({
        brandName,
        customerName: parsed.customerName || parsed.to,
        customerEmail: parsed.to,
        supportEmail,
        subject: parsed.subject,
        message: parsed.message,
      }),
      replyTo: { email: selectedMailboxEmail, name: auth.data.admin.name },
    })

    const preview = buildPreview(parsed.message)
    const sharedMailbox = getSharedMailboxEmail()
    const ownMailbox = auth.data.admin.email.trim().toLowerCase()

    const docs: Array<Record<string, unknown>> = []
    docs.push({
      mailboxType: "user",
      mailboxEmail: ownMailbox,
      folder: "sent",
      direction: "outbound",
      status: result.ok ? "sent" : "failed",
      from: { email: selectedMailboxEmail, name: auth.data.admin.name },
      to: [{ email: parsed.to, name: parsed.customerName || null }],
      subject: parsed.subject,
      body: parsed.message,
      preview,
      error: result.error || null,
      createdBy: {
        adminId: auth.data.admin.id,
        email: auth.data.admin.email,
        name: auth.data.admin.name,
        role: auth.data.admin.role,
      },
    })
    if (parsed.mailbox === "shared") {
      docs.push({
        mailboxType: "shared",
        mailboxEmail: sharedMailbox,
        folder: "sent",
        direction: "outbound",
        status: result.ok ? "sent" : "failed",
        from: { email: selectedMailboxEmail, name: auth.data.admin.name },
        to: [{ email: parsed.to, name: parsed.customerName || null }],
        subject: parsed.subject,
        body: parsed.message,
        preview,
        error: result.error || null,
        createdBy: {
          adminId: auth.data.admin.id,
          email: auth.data.admin.email,
          name: auth.data.admin.name,
          role: auth.data.admin.role,
        },
      })
    }
    await AdminMailboxMessage.insertMany(docs)

    await recordAdminAudit({
      adminId: auth.data.admin.id,
      action: "SEND_MAILBOX_EMAIL",
      targetType: "mail",
      targetId: parsed.to,
      metadata: {
        mailbox: parsed.mailbox,
        subject: parsed.subject,
        status: result.ok ? "sent" : "failed",
      },
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error || "No se pudo enviar el correo" }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
