import { DEMO_MAIL_MESSAGES } from "@/lib/admin-demo-data"

type DemoMailMessage = (typeof DEMO_MAIL_MESSAGES)[number]
type DemoFolder = "inbox" | "sent" | "trash"

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

let demoMailState: DemoMailMessage[] = deepClone(DEMO_MAIL_MESSAGES)

function adaptMailboxForDemoUser(message: DemoMailMessage, demoUserEmail: string): DemoMailMessage {
  if (message.mailboxType === "user" && message.mailboxEmail === "demo@clinvetia.com") {
    const from =
      message.from.email === "demo@clinvetia.com"
        ? { ...message.from, email: demoUserEmail }
        : message.from
    const to = message.to.map((recipient) =>
      recipient.email === "demo@clinvetia.com"
        ? { ...recipient, email: demoUserEmail }
        : recipient
    )
    return { ...message, mailboxEmail: demoUserEmail, from, to }
  }
  return message
}

export function listDemoMailMessages(params: {
  demoUserEmail: string
  mailboxEmail: string
  folder: DemoFolder
}) {
  return demoMailState
    .map((item) => adaptMailboxForDemoUser(item, params.demoUserEmail))
    .filter((item) => item.mailboxEmail === params.mailboxEmail && item.folder === params.folder)
}

export function moveDemoMailMessages(params: {
  ids: string[]
  folder: DemoFolder
  demoUserEmail: string
}) {
  const allowedMailboxEmails = new Set([params.demoUserEmail, "info@clinvetia.com"])
  const ids = new Set(params.ids)
  let moved = 0
  demoMailState = demoMailState.map((item) => {
    const adapted = adaptMailboxForDemoUser(item, params.demoUserEmail)
    if (!ids.has(adapted.id)) return item
    if (!allowedMailboxEmails.has(adapted.mailboxEmail)) return item
    moved += 1
    return { ...item, folder: params.folder, updatedAt: new Date().toISOString() }
  })
  return moved
}

export function addDemoSentMail(params: {
  mailbox: "self" | "shared"
  demoUserEmail: string
  to: string
  customerName?: string
  subject: string
  body: string
}) {
  const now = new Date().toISOString()
  const mailboxEmail = params.mailbox === "shared" ? "info@clinvetia.com" : "demo@clinvetia.com"
  const fromEmail = params.mailbox === "shared" ? "info@clinvetia.com" : "demo@clinvetia.com"
  const base: DemoMailMessage = {
    id: `mail-demo-${crypto.randomUUID()}`,
    mailboxType: params.mailbox === "shared" ? "shared" : "user",
    mailboxEmail,
    folder: "sent",
    direction: "outbound",
    status: "sent",
    from: { email: fromEmail, name: "Usuario Demo" },
    to: [{ email: params.to, name: params.customerName || params.to }],
    subject: params.subject,
    body: params.body,
    preview: params.body.replace(/\s+/g, " ").trim().slice(0, 180),
    createdAt: now,
    updatedAt: now,
    error: null,
  }
  demoMailState.unshift(base)
}

export function resetDemoMailMessages() {
  demoMailState = deepClone(DEMO_MAIL_MESSAGES)
}
