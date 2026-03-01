import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-auth"
import { dbConnect } from "@/lib/db"
import { AdminMailboxMessage } from "@/models/AdminMailboxMessage"
import { canUseSharedMailbox, getSharedMailboxEmail } from "@/lib/admin-mailbox"
import { listDemoMailMessages, moveDemoMailMessages } from "@/lib/admin-demo-mail-state"

const querySchema = z.object({
  mailbox: z.enum(["self", "shared"]).default("self"),
  folder: z.enum(["inbox", "sent", "trash"]).default("inbox"),
  q: z.string().optional(),
  status: z.enum(["all", "received", "sent", "failed"]).default("all"),
  hasError: z.enum(["all", "yes", "no"]).default("all"),
  to: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
})

const moveSchema = z.object({
  action: z.literal("move"),
  ids: z.array(z.string().min(1)).min(1).max(100),
  folder: z.enum(["inbox", "sent", "trash"]),
})

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const parsed = querySchema.parse({
    mailbox: searchParams.get("mailbox") || "self",
    folder: searchParams.get("folder") || "inbox",
    q: searchParams.get("q") || undefined,
    status: searchParams.get("status") || "all",
    hasError: searchParams.get("hasError") || "all",
    to: searchParams.get("to") || undefined,
    fromDate: searchParams.get("fromDate") || undefined,
    toDate: searchParams.get("toDate") || undefined,
    page: searchParams.get("page") || 1,
    pageSize: searchParams.get("pageSize") || 25,
  })

  const canAccessShared = canUseSharedMailbox(auth.data.admin.role)
  if (parsed.mailbox === "shared" && !canAccessShared) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (auth.data.admin.role === "demo") {
    const demoSelf = auth.data.admin.email.trim().toLowerCase()
    const demoMailboxEmail = parsed.mailbox === "shared" ? getSharedMailboxEmail() : demoSelf
    const q = parsed.q?.trim().toLowerCase() || ""
    const toNeedle = parsed.to?.trim().toLowerCase() || ""
    const fromDate = parsed.fromDate ? new Date(parsed.fromDate) : null
    const toDate = parsed.toDate ? new Date(parsed.toDate) : null
    if (fromDate && !Number.isNaN(fromDate.getTime())) fromDate.setHours(0, 0, 0, 0)
    if (toDate && !Number.isNaN(toDate.getTime())) toDate.setHours(23, 59, 59, 999)

    const filtered = listDemoMailMessages({
      demoUserEmail: demoSelf,
      mailboxEmail: demoMailboxEmail,
      folder: parsed.folder,
    })
      .filter((item) => (parsed.status === "all" ? true : item.status === parsed.status))
      .filter((item) => {
        if (parsed.hasError === "yes") return Boolean(item.error)
        if (parsed.hasError === "no") return !item.error
        return true
      })
      .filter((item) => (toNeedle ? item.to.some((recipient) => recipient.email.toLowerCase().includes(toNeedle)) : true))
      .filter((item) => {
        if (!q) return true
        const haystack = `${item.subject} ${item.body} ${item.preview} ${item.from.email} ${item.to.map((t) => t.email).join(" ")}`
        return haystack.toLowerCase().includes(q)
      })
      .filter((item) => {
        const createdAt = new Date(item.createdAt)
        if (fromDate && !Number.isNaN(fromDate.getTime()) && createdAt < fromDate) return false
        if (toDate && !Number.isNaN(toDate.getTime()) && createdAt > toDate) return false
        return true
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

    const total = filtered.length
    const skip = (parsed.page - 1) * parsed.pageSize
    const messages = filtered.slice(skip, skip + parsed.pageSize)

    return NextResponse.json({
      messages,
      pagination: {
        page: parsed.page,
        pageSize: parsed.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
      },
      mailboxes: {
        self: demoSelf,
        shared: null,
      },
      capabilities: {
        canAccessShared: false,
      },
      isDemo: true,
    })
  }

  const mailboxEmail =
    parsed.mailbox === "shared"
      ? getSharedMailboxEmail()
      : auth.data.admin.email.trim().toLowerCase()

  await dbConnect()

  const filter: Record<string, unknown> = {
    mailboxEmail,
    folder: parsed.folder,
  }

  const q = parsed.q?.trim()
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    filter.$or = [
      { subject: regex },
      { body: regex },
      { preview: regex },
      { "from.email": regex },
      { "from.name": regex },
      { "to.email": regex },
      { "to.name": regex },
    ]
  }

  if (parsed.status !== "all") {
    filter.status = parsed.status
  }
  if (parsed.hasError === "yes") {
    filter.error = { $ne: null }
  } else if (parsed.hasError === "no") {
    filter.error = null
  }
  const toFilter = parsed.to?.trim()
  if (toFilter) {
    const regex = new RegExp(toFilter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    filter["to.email"] = regex
  }
  const createdAtFilter: Record<string, Date> = {}
  const fromDate = parsed.fromDate ? new Date(parsed.fromDate) : null
  const toDate = parsed.toDate ? new Date(parsed.toDate) : null
  if (fromDate && !Number.isNaN(fromDate.getTime())) {
    fromDate.setHours(0, 0, 0, 0)
    createdAtFilter.$gte = fromDate
  }
  if (toDate && !Number.isNaN(toDate.getTime())) {
    toDate.setHours(23, 59, 59, 999)
    createdAtFilter.$lte = toDate
  }
  if (Object.keys(createdAtFilter).length > 0) {
    filter.createdAt = createdAtFilter
  }

  const skip = (parsed.page - 1) * parsed.pageSize
  const [messages, total] = await Promise.all([
    AdminMailboxMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parsed.pageSize).lean(),
    AdminMailboxMessage.countDocuments(filter),
  ])

  return NextResponse.json({
    messages: messages.map((message) => ({
      id: String(message._id),
      mailboxType: message.mailboxType,
      mailboxEmail: message.mailboxEmail,
      folder: message.folder,
      direction: message.direction,
      status: message.status,
      from: message.from,
      to: message.to ?? [],
      subject: message.subject,
      body: message.body,
      preview: message.preview,
      relatedType: message.relatedType ?? null,
      relatedId: message.relatedId ?? null,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      error: message.error ?? null,
      createdBy: message.createdBy ?? null,
    })),
    pagination: {
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
    },
    mailboxes: {
      self: auth.data.admin.email.trim().toLowerCase(),
      shared: canAccessShared ? getSharedMailboxEmail() : null,
    },
    capabilities: {
      canAccessShared,
    },
    isDemo: false,
  })
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = moveSchema.parse(body)
    if (auth.data.admin.role === "demo") {
      const demoSelf = auth.data.admin.email.trim().toLowerCase()
      moveDemoMailMessages({
        ids: parsed.ids,
        folder: parsed.folder,
        demoUserEmail: demoSelf,
      })
      return NextResponse.json({ ok: true, demo: true })
    }
    const canAccessShared = canUseSharedMailbox(auth.data.admin.role)
    const ownMailbox = auth.data.admin.email.trim().toLowerCase()
    const sharedMailbox = getSharedMailboxEmail()

    await dbConnect()
    const messages = await AdminMailboxMessage.find({ _id: { $in: parsed.ids } })
      .select("_id mailboxEmail")
      .lean()

    const forbidden = messages.find((message) => {
      const mailboxEmail = String(message.mailboxEmail || "").toLowerCase()
      if (mailboxEmail === ownMailbox) return false
      if (mailboxEmail === sharedMailbox && canAccessShared) return false
      return true
    })
    if (forbidden) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await AdminMailboxMessage.updateMany(
      { _id: { $in: parsed.ids } },
      { $set: { folder: parsed.folder } }
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
