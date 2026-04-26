import { createHmac, timingSafeEqual } from "crypto"
import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { WhatsAppConversation } from "@/models/WhatsAppConversation"
import { Session } from "@/models/Session"
import { callN8nWhatsAppWebhook, isN8nWhatsAppConfigured } from "@/lib/n8n-integration"
import { sendWhatsAppText } from "@/lib/kapso-whatsapp"

type ChatAssistantResponse = {
  reply: string
  openCalendar?: boolean
  openRoiCalculator?: boolean
  state?: Record<string, unknown>
  booking?:
    | {
        bookingId: string
        accessToken: string
        date: string
        time: string
        duration: number
      }
    | null
}

const DEFAULT_CHAT_STATE = { intent: "none", step: "idle" }

type InboundWhatsAppMessage = {
  from: string
  text: string
  timestamp?: string
}

function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL
  if (envUrl) return envUrl.replace(/\/+$/, "")
  const url = new URL(req.url)
  return `${url.protocol}//${url.host}`
}

function computeRoi(monthlyPatients: number, averageTicket: number, conversionLoss: number) {
  const perdidaMensual = monthlyPatients * (conversionLoss / 100) * averageTicket
  const recuperacionEstimada = perdidaMensual * 0.7
  return Math.round(((recuperacionEstimada - 297) / 297) * 100)
}

function parseNumberFromText(text: string) {
  const normalized = text.replace(",", ".")
  const match = normalized.match(/-?\d+(\.\d+)?/)
  if (!match) return null
  const value = Number(match[0])
  return Number.isFinite(value) ? value : null
}

function splitForWhatsApp(text: string) {
  if (text.length <= 900) return [text]
  const chunks: string[] = []
  let rest = text
  while (rest.length > 900) {
    const cut = rest.lastIndexOf("\n", 900)
    const index = cut > 0 ? cut : 900
    chunks.push(rest.slice(0, index).trim())
    rest = rest.slice(index).trim()
  }
  if (rest) chunks.push(rest)
  return chunks
}

function extractMetaWebhookMessages(body: unknown): InboundWhatsAppMessage[] {
  if (!body || typeof body !== "object") return []

  const entries = Array.isArray((body as { entry?: unknown }).entry) ? (body as { entry: unknown[] }).entry : []
  return entries
    .flatMap((entry) => (Array.isArray((entry as { changes?: unknown }).changes) ? (entry as { changes: unknown[] }).changes : []))
    .flatMap((change) => {
      const messages = (change as { value?: { messages?: unknown } }).value?.messages
      return Array.isArray(messages) ? messages : []
    })
    .filter((message): message is { type?: string; text?: { body?: string }; from?: string; timestamp?: string } => {
      return Boolean(
        message &&
          typeof message === "object" &&
          (message as { type?: unknown }).type === "text" &&
          typeof (message as { text?: { body?: unknown } }).text?.body === "string" &&
          typeof (message as { from?: unknown }).from === "string",
      )
    })
    .map((message) => ({
      from: message.from || "",
      text: message.text?.body || "",
      timestamp: message.timestamp,
    }))
}

function extractKapsoWebhookMessages(body: unknown): InboundWhatsAppMessage[] {
  if (!body || typeof body !== "object") return []

  const payload = body as {
    event?: unknown
    message?: {
      type?: unknown
      text?: { body?: unknown }
      timestamp?: unknown
      kapso?: { content?: unknown; direction?: unknown }
    }
    messages?: unknown
    conversation?: { phone_number?: unknown; kapso?: { contact_name?: unknown } }
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : payload.message ? [payload.message] : []
  if (!messages.length) return []

  return messages
    .filter((message): message is NonNullable<typeof payload.message> => {
      if (!message || typeof message !== "object") return false
      const direction = message.kapso?.direction
      const event = typeof payload.event === "string" ? payload.event : null
      return direction === "inbound" || event === "whatsapp.message.received" || !event
    })
    .map((message) => {
      const textBody = typeof message.text?.body === "string" ? message.text.body : null
      const kapsoContent = typeof message.kapso?.content === "string" ? message.kapso.content : null
      const from = typeof payload.conversation?.phone_number === "string" ? payload.conversation.phone_number.replace(/[^\d]/g, "") : ""
      return {
        from,
        text: textBody || kapsoContent || "",
        timestamp: typeof message.timestamp === "string" ? message.timestamp : undefined,
      }
    })
    .filter((message) => message.from && message.text)
}

function extractInboundMessages(body: unknown): InboundWhatsAppMessage[] {
  const kapsoMessages = extractKapsoWebhookMessages(body)
  if (kapsoMessages.length) return kapsoMessages
  return extractMetaWebhookMessages(body)
}

function verifyKapsoWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.KAPSO_WEBHOOK_SECRET?.trim()
  if (!secret || !signature) return true

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex")
  const expectedBuffer = Buffer.from(expected, "hex")
  const actualBuffer = Buffer.from(signature, "hex")

  if (expectedBuffer.length !== actualBuffer.length) return false
  return timingSafeEqual(expectedBuffer, actualBuffer)
}

async function callChatAssistant(req: Request, payload: {
  message: string
  state?: Record<string, unknown>
  sessionToken?: string | null
  bookingToken?: string | null
}): Promise<{ ok: boolean; data: ChatAssistantResponse }> {
  const baseUrl = getBaseUrl(req)
  const res = await fetch(`${baseUrl}/api/chat/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const data = (await res.json().catch(() => null)) as ChatAssistantResponse | null
  if (!res.ok || !data) {
    return {
      ok: false,
      data: {
        reply: "Ahora mismo no pude procesarlo. Si quieres, lo retomamos en un momento.",
        state: DEFAULT_CHAT_STATE,
      } satisfies ChatAssistantResponse,
    }
  }
  return { ok: true, data }
}

async function handleRoiFlow(params: {
  text: string
  conversation: {
    roiStep?: string | null
    roiDraft?: { monthlyPatients?: number | null; averageTicket?: number | null; conversionLoss?: number | null }
  }
}) {
  const text = params.text
  const roiStep = params.conversation.roiStep || "monthlyPatients"
  const roiDraft = params.conversation.roiDraft || {}
  const value = parseNumberFromText(text)
  if (value === null) {
    if (roiStep === "monthlyPatients") return { ok: true as const, reply: "Pásame un número de pacientes al mes, por ejemplo 220." }
    if (roiStep === "averageTicket") return { ok: true as const, reply: "Pásame el ticket medio en €, por ejemplo 45." }
    return { ok: true as const, reply: "Pásame el % de conversión perdido, por ejemplo 18." }
  }

  if (roiStep === "monthlyPatients") {
    return {
      ok: true as const,
      nextRoiStep: "averageTicket",
      nextRoiDraft: { ...roiDraft, monthlyPatients: Math.max(0, Math.round(value)) },
      reply: "Genial. Ahora dime tu ticket medio en €.",
    }
  }

  if (roiStep === "averageTicket") {
    return {
      ok: true as const,
      nextRoiStep: "conversionLoss",
      nextRoiDraft: { ...roiDraft, averageTicket: Math.max(0, Math.round(value)) },
      reply: "Genial. Y qué % de conversión crees que estás perdiendo ahora?",
    }
  }

  const monthlyPatients = Math.max(0, Math.round(roiDraft.monthlyPatients ?? 0))
  const averageTicket = Math.max(0, Math.round(roiDraft.averageTicket ?? 0))
  const conversionLoss = Math.max(0, Math.min(100, Math.round(value)))
  const roi = computeRoi(monthlyPatients, averageTicket, conversionLoss)

  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)
  await Session.create({
    token: sessionToken,
    expiresAt,
    roi: { monthlyPatients, averageTicket, conversionLoss, roi },
  })

  return {
    ok: true as const,
    nextRoiStep: null,
    nextRoiDraft: { monthlyPatients, averageTicket, conversionLoss },
    createdSessionToken: sessionToken,
    reply: "Listo, ya tengo tu ROI. Ahora te propongo horarios.",
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
  if (mode === "subscribe" && challenge && verifyToken && token === verifyToken) {
    return new Response(challenge, { status: 200 })
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-webhook-signature")
    if (!verifyKapsoWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const messages = extractInboundMessages(body)

    if (!messages.length) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    if (isN8nWhatsAppConfigured()) {
      for (const message of messages) {
        const text = String(message.text || "").trim()
        const phone = String(message.from || "").trim()
        if (!text || !phone) continue

        await callN8nWhatsAppWebhook({
          event: "whatsapp.message.received",
          channel: "whatsapp",
          source: "kapso",
          message: text,
          phone,
          phoneNumberId: typeof body?.phone_number_id === "string" ? body.phone_number_id : null,
          history: [],
          locale: "es",
        })
      }

      return NextResponse.json({ ok: true, delegatedToN8n: true })
    }

    await dbConnect()

    for (const message of messages) {
      const phone = String(message.from)
      const text = String(message.text || "").trim()
      if (!text) continue

      const conversationRaw = await WhatsAppConversation.findOne({ phone }).lean<{
        phone: string
        name?: string | null
        state?: Record<string, unknown>
        sessionToken?: string | null
        bookingToken?: string | null
        roiStep?: string | null
        roiDraft?: { monthlyPatients?: number | null; averageTicket?: number | null; conversionLoss?: number | null }
      } | null>()

      const conversation = conversationRaw || {
        phone,
        state: DEFAULT_CHAT_STATE,
        sessionToken: null,
        bookingToken: null,
        roiStep: null,
        roiDraft: {},
      }

      let pendingSessionToken = conversation.sessionToken || null
      let pendingBookingToken = conversation.bookingToken || null
      let pendingState = conversation.state || DEFAULT_CHAT_STATE
      let pendingRoiStep = conversation.roiStep || null
      let pendingRoiDraft = conversation.roiDraft || {}

      if (pendingRoiStep) {
        const roiResult = await handleRoiFlow({
          text,
          conversation: { roiStep: pendingRoiStep, roiDraft: pendingRoiDraft },
        })
        await sendWhatsAppText(phone, roiResult.reply)
        pendingRoiStep = roiResult.nextRoiStep ?? null
        pendingRoiDraft = roiResult.nextRoiDraft ?? pendingRoiDraft
        if (roiResult.createdSessionToken) {
          pendingSessionToken = roiResult.createdSessionToken
          const resume = await callChatAssistant(req, {
            message: "quiero reservar una cita",
            state: DEFAULT_CHAT_STATE,
            sessionToken: pendingSessionToken,
            bookingToken: pendingBookingToken,
          })
          for (const chunk of splitForWhatsApp(resume.data.reply)) {
            await sendWhatsAppText(phone, chunk)
          }
          pendingState = resume.data.state || DEFAULT_CHAT_STATE
          const resumeBooking = "booking" in resume.data ? resume.data.booking : undefined
          if (resumeBooking === null) pendingBookingToken = null
          if (resumeBooking?.accessToken) pendingBookingToken = resumeBooking.accessToken
        }
      } else {
        const result = await callChatAssistant(req, {
          message: text,
          state: pendingState,
          sessionToken: pendingSessionToken,
          bookingToken: pendingBookingToken,
        })

        if (result.data.openRoiCalculator) {
          pendingRoiStep = "monthlyPatients"
          pendingRoiDraft = {}
          for (const chunk of splitForWhatsApp("Antes de agendar, te hago 3 preguntas rápidas para calcular tu ROI. Empezamos: cuántos pacientes atiendes al mes?")) {
            await sendWhatsAppText(phone, chunk)
          }
        } else {
          for (const chunk of splitForWhatsApp(result.data.reply)) {
            await sendWhatsAppText(phone, chunk)
          }
        }

        pendingState = result.data.state || pendingState
        const resultBooking = "booking" in result.data ? result.data.booking : undefined
        if (resultBooking === null) pendingBookingToken = null
        if (resultBooking?.accessToken) pendingBookingToken = resultBooking.accessToken
      }

      await WhatsAppConversation.updateOne(
        { phone },
        {
          $set: {
            state: pendingState,
            sessionToken: pendingSessionToken,
            bookingToken: pendingBookingToken,
            roiStep: pendingRoiStep,
            roiDraft: pendingRoiDraft,
            lastInboundAt: new Date(),
            lastOutboundAt: new Date(),
          },
        },
        { upsert: true },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("WhatsApp webhook error", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
