import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { Booking } from "@/models/Booking"
import { Session } from "@/models/Session"
import { Contact } from "@/models/Contact"
import { sendBrevoEmail } from "@/lib/brevo"
import { leadSummaryEmail } from "@/lib/emails"
import { buildICS } from "@/lib/ics"
import { appendBookingEmailEvent, buildGoogleMeetLink } from "@/lib/booking-communication"
import { clearRoiForBookingContext } from "@/lib/roi-cleanup"
import { DEMO_BOOKABLE_TIME_SLOTS, isBookableDemoTimeSlot, isValidDemoTimeSlot } from "@/lib/demo-schedule"
import {
  chatAssistantRequestSchema,
  chatAssistantResponseSchema,
  type ChatHistoryMessage,
  type ChatLocale,
  type ChatSlot,
  type ChatState,
  type N8nChatWebhookPayload,
} from "@/lib/chat-contract"
import { callN8nChatWebhook, isN8nChatConfigured } from "@/lib/n8n-integration"

const schema = chatAssistantRequestSchema

function isAffirmative(text: string) {
  return /\b(si|sí|correcto|ok|okey|vale|perfecto|confirmo|claro|exacto|de acuerdo|yes|yep|yeah|confirm|sure|correct)\b/i.test(text)
}

function isNegative(text: string) {
  return /\b(no|incorrecto|mal|cambiar|otro|equivocado|para nada|wrong|incorrect|change|different|nope|nah)\b/i.test(text)
}

function extractEmail(text: string) {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match?.[0]?.toLowerCase() || null
}

function extractPhone(text: string) {
  const candidates = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/g) || []
  for (const candidate of candidates) {
    const compact = candidate.trim().replace(/[().\s-]+/g, "")
    const hasPlus = compact.startsWith("+")
    const digits = compact.replace(/[^\d]/g, "")
    if (digits.length >= 9 && digits.length <= 15) {
      return hasPlus ? `+${digits}` : digits
    }
  }
  return null
}

function extractBookingId(text: string) {
  const match = text.match(/\b[a-f0-9]{24}\b/i)
  return match?.[0] || null
}

function extractBookingToken(text: string) {
  const match = text.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i)
  return match?.[0] || null
}

function extractCity(text: string) {
  const compact = text
    .replace(/\b(estoy en|soy de|desde|vivo en|me encuentro en|in|from|based in)\b/gi, "")
    .replace(/[.,;:!?]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (compact.length < 2) return null
  if (/\d{3,}/.test(compact)) return null
  if (compact.split(" ").length > 5) return null
  return compact.slice(0, 80)
}

function isObjection(text: string) {
  return /\b(no me interesa|no ahora|despues|después|déjame pensarlo|dejame pensarlo|estoy ocupado|ocupada|no tengo tiempo|enviame info|envíame info|prefiero no|ahora no|not interested|not now|later|let me think|busy|i don't have time|send me info|prefer not now)\b/i.test(
    text,
  )
}

function objectionReply(attempt: number, locale: ChatLocale) {
  if (attempt <= 1) {
    return locale === "en"
      ? "I understand 😊 Quick one: what frustrates you most today about lead capture or follow-up in your clinic?"
      : "Te entiendo 😊 Una rápida: qué te frustra más hoy de la captación o del seguimiento en tu clínica?"
  }
  if (attempt === 2) {
    return locale === "en"
      ? "I respect that. Many told us the same at first. How are you managing leads and follow-up now?"
      : "Lo respeto. Muchos nos dijeron eso al inicio. Cómo gestionáis ahora los leads y el seguimiento?"
  }
  if (attempt === 3) {
    return locale === "en"
      ? "Totally. If you could improve just one thing in client care today, what would it be?"
      : "Totalmente. Si hoy pudieras mejorar solo una cosa de la atención al cliente, cuál sería?"
  }
  return locale === "en"
    ? "No pressure, just curious: what's your growth goal for the next 3-6 months in your clinic? 📊"
    : "Sin compromiso, solo por curiosidad: cuál es tu meta de crecimiento para los próximos 3-6 meses en tu clínica? 📊"
}

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function extractMentionedTime(text: string) {
  const timeWithMinutes = text.match(/\b([01]?\d|2[0-3])[:h.]([0-5]\d)\s*(am|pm)?\b/i)
  if (timeWithMinutes) {
    let hour = Number(timeWithMinutes[1])
    const minute = Number(timeWithMinutes[2])
    const meridiem = (timeWithMinutes[3] || "").toLowerCase()
    if (meridiem === "pm" && hour < 12) hour += 12
    if (meridiem === "am" && hour === 12) hour = 0
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
  }
  const hourOnly = text.match(/\b([1-9]|1[0-2])\s*(am|pm)\b/i)
  if (hourOnly) {
    let hour = Number(hourOnly[1])
    const meridiem = (hourOnly[2] || "").toLowerCase()
    if (meridiem === "pm" && hour < 12) hour += 12
    if (meridiem === "am" && hour === 12) hour = 0
    return `${String(hour).padStart(2, "0")}:00`
  }
  return null
}

function extractSlotChoice(text: string, slots: ChatSlot[]) {
  const length = slots.length
  const oneBased = text.match(/\b([1-9])\b/)
  if (oneBased) {
    const index = Number(oneBased[1]) - 1
    if (index >= 0 && index < length) return index
  }
  const normalized = normalizeText(text)
  const ordinalMap: Array<{ pattern: RegExp; index: number }> = [
    { pattern: /\b(primera|primer|uno|first)\b/i, index: 0 },
    { pattern: /\b(segunda|segundo|dos|second)\b/i, index: 1 },
    { pattern: /\b(tercera|tercer|tres|third)\b/i, index: 2 },
  ]
  for (const item of ordinalMap) {
    if (item.index < length && item.pattern.test(normalized)) return item.index
  }
  const mentionedTime = extractMentionedTime(normalized)
  if (mentionedTime) {
    const byTime = slots.findIndex((slot) => slot.time === mentionedTime)
    if (byTime >= 0) return byTime
  }
  const isoDate = normalized.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0]
  if (isoDate) {
    const byDate = slots.findIndex((slot) => slot.date === isoDate)
    if (byDate >= 0) return byDate
  }
  return null
}

function isServiceQuestion(text: string) {
  return /\b(que es|qué es|explica|explicame|explícame|como funciona|cómo funciona|agente|agentes|ia|inteligencia artificial|veterinaria|veterinarias|servicio|solucion|solución|what is|explain|how it works|agent|agents|ai|artificial intelligence|veterinary|service|solution)\b/i.test(
    text,
  )
}

function isGreeting(text: string) {
  return /\b(hola|buenas|hey|hello|hi|good morning|good afternoon|good evening|buenos dias|buenas tardes|buenas noches)\b/i.test(text)
}

function shortContext(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim()
  return normalized.length > 90 ? `${normalized.slice(0, 90)}...` : normalized
}

function sanitizeHistory(
  messages?: Array<{ role: "assistant" | "user"; content: string; timestamp?: string | Date }> | null
): ChatHistoryMessage[] {
  return (messages || [])
    .map<ChatHistoryMessage>((msg) => ({
      role: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: msg.content.replace(/\s+/g, " ").trim().slice(0, 400),
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
    }))
    .filter((msg) => {
      if (!msg.content.length) return false
      if (!msg.timestamp) return true
      return !Number.isNaN(Date.parse(String(msg.timestamp)))
    })
    .slice(-24)
}

function withCurrentUserMessage(history: ChatHistoryMessage[], message: string): ChatHistoryMessage[] {
  const normalizedMessage = message.replace(/\s+/g, " ").trim()
  if (!normalizedMessage) return history
  const last = history[history.length - 1]
  if (last?.role === "user" && last.content === normalizedMessage) {
    return history
  }
  return [...history, { role: "user" as const, content: normalizedMessage, timestamp: new Date().toISOString() }]
}

function selectTranscriptHistory(history: ChatHistoryMessage[], maxItems = 8, maxChars = 1400) {
  const normalized = history
    .map((item, index) => ({
      item,
      index,
      ts: item.timestamp ? Date.parse(String(item.timestamp)) : Number.NaN,
    }))
    .sort((a, b) => {
      const aTs = Number.isNaN(a.ts) ? -1 : a.ts
      const bTs = Number.isNaN(b.ts) ? -1 : b.ts
      if (aTs === bTs) return a.index - b.index
      return aTs - bTs
    })
    .map((entry) => entry.item)
    .slice(-maxItems)

  const selected: ChatHistoryMessage[] = []
  let chars = 0
  for (let i = normalized.length - 1; i >= 0; i -= 1) {
    const candidate = normalized[i]
    const rendered = `${candidate.role}: ${candidate.content}`
    if (selected.length > 0 && chars + rendered.length > maxChars) break
    selected.unshift(candidate)
    chars += rendered.length
  }
  return selected
}

function sanitizeSummary(summary?: string | null) {
  return (summary || "").replace(/\s+/g, " ").trim().slice(0, 1800)
}

function summarizeArchivedMessages(existingSummary: string, archived: ChatHistoryMessage[]) {
  const archivedText = archived
    .map((item) => `${item.role === "assistant" ? "A" : "U"}: ${item.content.replace(/\s+/g, " ").trim()}`)
    .join(" | ")
  const merged = [sanitizeSummary(existingSummary), archivedText].filter(Boolean).join(" | ")
  if (merged.length <= 1800) return merged
  return merged.slice(merged.length - 1800)
}

function compactHistoryAndSummary(
  history: ChatHistoryMessage[],
  summary?: string | null,
): { history: ChatHistoryMessage[]; summary: string } {
  const maxHistory = 12
  const keepRecent = 8
  const cleanSummary = sanitizeSummary(summary)
  if (history.length <= maxHistory) {
    return { history: history.slice(-maxHistory), summary: cleanSummary }
  }
  const archiveCount = Math.max(1, history.length - keepRecent)
  const archived = history.slice(0, archiveCount)
  const recent = history.slice(archiveCount)
  const nextSummary = summarizeArchivedMessages(cleanSummary, archived)
  return { history: recent, summary: nextSummary }
}

function detectIntents(text: string) {
  const normalized = normalizeText(text)
  const deniesCancel = /\b(no|dont|don't|do not)\b.{0,20}\b(cancelar|cancel)\b/i.test(normalized)
  const deniesReschedule = /\b(no|dont|don't|do not)\b.{0,25}\b(reagendar|reprogramar|reschedule|change appointment)\b/i.test(normalized)
  const deniesBook = /\b(no|dont|don't|do not)\b.{0,20}\b(reservar|book|agendar|appointment)\b/i.test(normalized)

  const wantsCancel = !deniesCancel && /\b(cancelar|cancela|anular|anula|dar de baja|cancel|cancellation)\b/i.test(normalized)
  const wantsReschedule =
    !deniesReschedule &&
    /\b(reagendar|reprogramar|cambiar hora|cambiar cita|otro horario|mover cita|reschedule|change time|change appointment|another slot)\b/i.test(normalized)
  const wantsBooking =
    !deniesBook && /\b(reservar|reserva|demo|cita|agendar|agenda|book|booking|appointment|schedule|calendario|calendar)\b/i.test(normalized)

  return { wantsBooking, wantsReschedule, wantsCancel }
}

const CHAT_SYSTEM_PROMPT = [
  "Eres Moka, el asistente conversacional de Clinvetia.",
  "Objetivo comercial: mover la conversacion hacia cita consultiva con datos completos.",
  "Regla critica de objeciones: ante rechazo, reintenta 4 veces con estrategias diferentes (curiosidad, identificacion, comparacion social, vision futura).",
  "No menciones IA, herramientas, APIs ni procesos internos.",
  "Habla de forma cercana, clara y tranquila.",
  "Escribe mensajes cortos y naturales, tono humano, una pregunta por mensaje.",
  "Valida emocion antes de redirigir y referencia lo que dijo el lead.",
  "Si hay objecion, responde con enfoque consultivo y orientado a cita.",
  "Evita frases roboticas: 'Excelente pregunta', 'No entendi tu mensaje', 'Te explico'.",
  "No inventes precios ni promesas no confirmadas.",
].join(" ")

function buildConversationContext(params: {
  userMessage: string
  locale: ChatLocale
  state: ChatState
  hasActiveBooking: boolean
  hasValidRoiSession: boolean
  chatSummary?: string | null
  history: ChatHistoryMessage[]
}) {
  const qualifiers = [
    params.state.qualificationStage ? `qualification_stage=${params.state.qualificationStage}` : null,
    params.state.leadContext ? `lead_context=${params.state.leadContext}` : null,
    params.state.objectionAttempts ? `objection_attempts=${params.state.objectionAttempts}` : null,
    params.hasActiveBooking ? "has_active_booking=true" : "has_active_booking=false",
    params.hasValidRoiSession ? "roi_ready=true" : "roi_ready=false",
  ]
    .filter(Boolean)
    .join(" | ")

  const languageGuard = params.locale === "en" ? "Respond only in English." : "Responde solo en español."
  const summary = sanitizeSummary(params.chatSummary)
  const transcript = selectTranscriptHistory(params.history)
    .map((item) => `${item.role === "assistant" ? "assistant" : "user"}: ${item.content.replace(/\s+/g, " ").trim()}`)
    .join("\n")
  return `${languageGuard}\nContext: ${qualifiers}\nLong-term summary: ${summary || "none"}\nRecent transcript:\n${transcript || "user: " + params.userMessage}\nCurrent user message: ${params.userMessage}`
}

async function generateConversationalReply(params: {
  userMessage: string
  locale: ChatLocale
  state: ChatState
  hasActiveBooking: boolean
  hasValidRoiSession: boolean
  chatSummary?: string | null
  history: ChatHistoryMessage[]
}) {
  const geminiApiKey = process.env.GEMINI_API_KEY
  const geminiPreferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  const geminiModels = Array.from(new Set([geminiPreferredModel, "gemini-2.0-flash", "gemini-2.0-flash-lite"]))
  const contextualInput = buildConversationContext(params)

  for (const model of geminiModels) {
    if (!geminiApiKey) break
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: CHAT_SYSTEM_PROMPT }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: contextualInput }],
              },
            ],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 220,
            },
          }),
          cache: "no-store",
        },
      )
      if (!res.ok) {
        continue
      }
      const data = (await res.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>
          }
        }>
      }
      const text = data.candidates
        ?.map((candidate) => candidate.content?.parts?.map((part) => part.text || "").join("\n") || "")
        .join("\n")
        .trim()
      if (text && text.length >= 40) return { text, provider: "gemini" as const }
    } catch {
      continue
    }
  }

  const openaiApiKey = process.env.OPENAI_API_KEY
  const openaiPreferredModel = process.env.OPENAI_MODEL || "gpt-4.1-mini"
  const openaiModels = Array.from(new Set([openaiPreferredModel, "gpt-4o-mini", "gpt-4.1-mini"]))

  for (const model of openaiModels) {
    if (!openaiApiKey) break
    try {
      const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model,
          input: [
            { role: "system", content: CHAT_SYSTEM_PROMPT },
            { role: "user", content: contextualInput },
          ],
          max_output_tokens: 220,
        }),
        cache: "no-store",
      })
      if (!res.ok) {
        continue
      }
      const data = (await res.json()) as {
        output_text?: string
        output?: Array<{
          content?: Array<{ type?: string; text?: string }>
        }>
      }
      const fromOutputText = data.output_text?.trim()
      if (fromOutputText) return { text: fromOutputText, provider: "openai" as const }
      const fromBlocks = data.output
        ?.flatMap((item) => item.content || [])
        .filter((part) => part?.type === "output_text" || part?.type === "text")
        .map((part) => part?.text || "")
        .join("\n")
        .trim()
      if (fromBlocks) return { text: fromBlocks, provider: "openai" as const }
    } catch {
      continue
    }
  }

  return null
}

function formatDateLabel(date: Date, time: string, locale: ChatLocale = "es") {
  const label = date.toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  return locale === "en" ? `${label} at ${time}` : `${label} a las ${time}`
}

async function findActiveBooking(params: { sessionToken?: string | null; bookingToken?: string | null }) {
  if (params.bookingToken) {
    const booking = await Booking.findOne({
      accessToken: params.bookingToken,
      status: { $in: ["pending", "confirmed"] },
      demoExpiresAt: { $gt: new Date() },
    })
    return booking
  }
  if (params.sessionToken) {
    const booking = await Booking.findOne({
      sessionToken: params.sessionToken,
      status: { $in: ["pending", "confirmed"] },
      demoExpiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 })
    return booking
  }
  return null
}

function hasCompleteRoi(session: {
  roi?: {
    monthlyPatients?: number | null
    averageTicket?: number | null
    conversionLoss?: number | null
    roi?: number | null
  } | null
} | null) {
  if (!session?.roi) return false
  return (
    typeof session.roi.monthlyPatients === "number" &&
    typeof session.roi.averageTicket === "number" &&
    typeof session.roi.conversionLoss === "number" &&
    typeof session.roi.roi === "number"
  )
}

async function buildSlots(limit = 3, locale: ChatLocale = "es") {
  const results: ChatSlot[] = []
  let dayOffset = 0
  while (results.length < limit && dayOffset < 30) {
    const date = new Date()
    date.setDate(date.getDate() + dayOffset)
    dayOffset += 1
    const day = date.getDay()
    if (day === 0 || day === 6) continue

    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const bookings = await Booking.find({
      date: { $gte: start, $lte: end },
      status: "confirmed",
    })
      .select("time")
      .lean()

    const unavailable = new Set(bookings.map((b) => String(b.time)))
    for (const time of DEMO_BOOKABLE_TIME_SLOTS) {
      if (unavailable.has(time)) continue
      const key = new Date(date)
      results.push({
        date: key.toISOString().slice(0, 10),
        time,
        label: formatDateLabel(key, time, locale),
      })
      if (results.length >= limit) break
    }
  }
  return results
}

function buildLeadNameFromEmail(email: string) {
  const local = email.split("@")[0] || "Cliente"
  const sanitized = local.replace(/[._-]+/g, " ").trim()
  return sanitized.length > 1 ? sanitized[0].toUpperCase() + sanitized.slice(1) : "Cliente"
}

async function upsertContactForChat(params: {
  bookingId: string
  sessionToken?: string | null
  email: string
  phone: string
  roi?: {
    monthlyPatients?: number | null
    averageTicket?: number | null
    conversionLoss?: number | null
    roi?: number | null
  } | null
}) {
  const nombre = buildLeadNameFromEmail(params.email)
  const payload = {
    nombre,
    email: params.email,
    telefono: params.phone,
    clinica: "Pendiente de completar",
    mensaje: "Reserva creada desde chat asistido",
    bookingId: params.bookingId,
    sessionToken: params.sessionToken ?? null,
    roi: params.roi ?? {},
  }

  const existingRaw = await Contact.findOne({ bookingId: params.bookingId }).select("_id").lean<{ _id: unknown } | null>()
  const existing = Array.isArray(existingRaw) ? existingRaw[0] : existingRaw
  if (existing?._id) {
    await Contact.updateOne({ _id: existing._id }, { $set: payload })
    return
  }
  await Contact.create(payload)
}

async function sendBookingSummaryEmailFromChat(params: {
  bookingId: string
  date: Date
  time: string
  duration: number
  email: string
  phone: string
  sessionToken?: string | null
  roi?: {
    monthlyPatients?: number | null
    averageTicket?: number | null
    conversionLoss?: number | null
    roi?: number | null
  } | null
}) {
  const supportEmail = process.env.BREVO_REPLY_TO || "info@clinvetia.com"
  const brandName = "Clinvetia"
  const name = buildLeadNameFromEmail(params.email)
  const dateLabel = params.date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
  const meetingLink = buildGoogleMeetLink(params.bookingId)
  const [hour, min] = params.time.split(":").map(Number)
  const start = new Date(params.date)
  start.setHours(hour, min, 0, 0)
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + params.duration)
  const ics = buildICS({
    uid: params.bookingId,
    start,
    end,
    summary: "Demo Clinvetia",
    description: `Demo personalizada con Clinvetia. Enlace Google Meet: ${meetingLink}`,
    location: meetingLink,
    url: meetingLink,
    organizerEmail: supportEmail,
    attendeeEmail: params.email,
  })

  await upsertContactForChat({
    bookingId: params.bookingId,
    sessionToken: params.sessionToken ?? null,
    email: params.email,
    phone: params.phone,
    roi: params.roi ?? null,
  })

  const subject = "Tu cita está confirmada"
  const roiForEmail = params.roi
    ? {
        monthlyPatients: params.roi.monthlyPatients ?? undefined,
        averageTicket: params.roi.averageTicket ?? undefined,
        conversionLoss: params.roi.conversionLoss ?? undefined,
        roi: params.roi.roi ?? undefined,
      }
    : null
  const htmlContent = leadSummaryEmail({
    brandName,
    nombre: name,
    email: params.email,
    telefono: params.phone,
    clinica: "Pendiente de completar",
    mensaje: "Reserva creada desde chat asistido",
    supportEmail,
    booking: {
      dateLabel,
      timeLabel: params.time,
      duration: params.duration,
      meetingLink,
    },
    roi: roiForEmail,
  })

  const emailResult = await sendBrevoEmail({
    to: [{ email: params.email, name }],
    subject,
    htmlContent,
    attachments: [{
      name: "clinvetia-cita.ics",
      content: Buffer.from(ics).toString("base64"),
      contentType: "text/calendar",
    }],
    replyTo: { email: supportEmail },
  })

  await appendBookingEmailEvent({
    bookingId: params.bookingId,
    category: "customer_summary",
    subject,
    intendedRecipient: params.email,
    deliveredTo: params.email,
    status: emailResult.ok ? "sent" : "failed",
    error: emailResult.ok ? null : emailResult.error ?? "Email delivery failed",
    message: "Reserva creada desde chat asistido",
    googleMeetLink: meetingLink,
  })

  return emailResult.ok
}

async function rescheduleBooking(bookingId: string, slot: ChatSlot) {
  if (!isValidDemoTimeSlot(slot.time) || !isBookableDemoTimeSlot(slot.time)) {
    return false
  }

  const date = new Date(`${slot.date}T00:00:00.000Z`)
  const [hour, min] = slot.time.split(":").map(Number)
  const demoDateTime = new Date(date)
  demoDateTime.setHours(hour, min, 0, 0)
  const demoExpiresAt = new Date(demoDateTime)
  demoExpiresAt.setMinutes(demoExpiresAt.getMinutes() + 30)
  const expiresAt = new Date(date)
  expiresAt.setHours(23, 59, 59, 999)
  const formExpiresAt = new Date()
  formExpiresAt.setMinutes(formExpiresAt.getMinutes() + 10)
  const startDay = new Date(date)
  startDay.setHours(0, 0, 0, 0)
  const endDay = new Date(date)
  endDay.setHours(23, 59, 59, 999)

  const conflict = await Booking.findOne({
    _id: { $ne: bookingId },
    date: { $gte: startDay, $lte: endDay },
    time: slot.time,
    status: "confirmed",
  }).lean()
  if (conflict) return false

  await Booking.updateOne(
    { _id: bookingId },
    {
      $set: {
        date,
        time: slot.time,
        duration: 30,
        status: "confirmed",
        expiresAt,
        formExpiresAt,
        demoExpiresAt,
      },
    },
  )
  return true
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.parse(body)
    const locale: ChatLocale = parsed.locale === "en" ? "en" : "es"
    const bypassHeader = req.headers.get("x-clinvetia-chat-bypass-n8n")?.trim()
    const canBypassN8n = Boolean(
      bypassHeader &&
        process.env.N8N_CHAT_WEBHOOK_SECRET &&
        bypassHeader === process.env.N8N_CHAT_WEBHOOK_SECRET,
    )

    if (!canBypassN8n && isN8nChatConfigured()) {
      const payload: N8nChatWebhookPayload = {
        event: "chat.message",
        channel: "web",
        source: "website-chatbot",
        requestId: crypto.randomUUID(),
        sentAt: new Date().toISOString(),
        message: parsed.message,
        locale,
        history: parsed.history ?? [],
        state: parsed.state,
        sessionToken: typeof parsed.sessionToken === "string" && parsed.sessionToken.trim().length > 0 ? parsed.sessionToken.trim() : null,
        bookingToken: typeof parsed.bookingToken === "string" && parsed.bookingToken.trim().length > 0 ? parsed.bookingToken.trim() : null,
        pathname: typeof parsed.pathname === "string" && parsed.pathname.trim().length > 0 ? parsed.pathname.trim() : null,
        pageUrl: typeof parsed.pageUrl === "string" && parsed.pageUrl.trim().length > 0 ? parsed.pageUrl.trim() : null,
      }

      const n8nResult = await callN8nChatWebhook(payload)

      if (n8nResult?.ok && n8nResult.data) {
        const externalResponse = chatAssistantResponseSchema.safeParse(n8nResult.data)
        if (externalResponse.success) {
          return NextResponse.json(externalResponse.data)
        }
      }
    }

    await dbConnect()

    const t = (es: string, en: string) => (locale === "en" ? en : es)
    const message = parsed.message.trim()
    const lower = message.toLowerCase()
    const { wantsBooking, wantsReschedule, wantsCancel } = detectIntents(message)
    const webBookingUrl = `${(process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "").replace(/\/+$/, "")}/demo`
    const rawSessionToken = typeof parsed.sessionToken === "string" ? parsed.sessionToken.trim() : ""
    const sessionToken = rawSessionToken.length > 0 ? rawSessionToken : null
    const current: ChatState = {
      intent: parsed.state?.intent || "none",
      step: parsed.state?.step || "idle",
      proposedSlots: parsed.state?.proposedSlots || [],
      selectedSlot: parsed.state?.selectedSlot || null,
      email: parsed.state?.email || null,
      phone: parsed.state?.phone || null,
      targetBookingId: parsed.state?.targetBookingId || null,
      targetBookingToken: parsed.state?.targetBookingToken || null,
      city: parsed.state?.city || null,
      objectionAttempts: parsed.state?.objectionAttempts || 0,
      qualificationStage: parsed.state?.qualificationStage || 0,
      leadContext: parsed.state?.leadContext || null,
    }

    const activeBooking = await findActiveBooking({
      sessionToken,
      bookingToken: parsed.bookingToken,
    })

    const activeSession = sessionToken
      ? await Session.findOne({ token: sessionToken, expiresAt: { $gt: new Date() } })
          .select("token expiresAt roi chatSummary chatHistory")
          .lean<{
            token: string
            expiresAt: Date
            chatSummary?: string | null
            chatHistory?: ChatHistoryMessage[]
            roi?: {
              monthlyPatients?: number | null
              averageTicket?: number | null
              conversionLoss?: number | null
              roi?: number | null
            } | null
          } | null>()
      : null
    const incomingHistory = sanitizeHistory(parsed.history)
    const persistedHistory = sanitizeHistory(activeSession?.chatHistory)
    const effectiveHistory = incomingHistory.length > 0 ? incomingHistory : persistedHistory
    const compactedBeforeReply = compactHistoryAndSummary(withCurrentUserMessage(effectiveHistory, message), activeSession?.chatSummary ?? "")
    const historyForCurrentTurn = compactedBeforeReply.history
    const chatSummaryForCurrentTurn = compactedBeforeReply.summary

    if (activeSession?.token) {
      await Session.updateOne(
        { token: activeSession.token, expiresAt: { $gt: new Date() } },
        { $set: { chatHistory: historyForCurrentTurn, chatSummary: chatSummaryForCurrentTurn } },
      )
    }

    const hasValidRoiSession = hasCompleteRoi(activeSession)
    const isBookingFlowStep = ["await_timezone", "await_booking_id", "await_slot", "await_email", "await_email_confirm", "await_phone", "await_phone_confirm"].includes(
      current.step || "",
    )
    const hasBookingIntent = current.intent === "book" || current.intent === "reschedule"

    const respond = async (payload: Record<string, unknown>, init?: ResponseInit) => {
      const replyText = typeof payload.reply === "string" ? payload.reply.replace(/\s+/g, " ").trim() : ""
      if (activeSession?.token && replyText) {
        const compactedAfterReply = compactHistoryAndSummary(
          [...historyForCurrentTurn, { role: "assistant" as const, content: replyText, timestamp: new Date().toISOString() }],
          chatSummaryForCurrentTurn,
        )
        await Session.updateOne(
          { token: activeSession.token, expiresAt: { $gt: new Date() } },
          { $set: { chatHistory: compactedAfterReply.history, chatSummary: compactedAfterReply.summary } },
        )
      }
      return NextResponse.json(payload, init)
    }

    if (current.step === "idle" && wantsBooking && !hasValidRoiSession) {
      return respond({
        reply: t(
          "Antes de reservar, hagamos primero tu cálculo ROI para entender mejor tu clínica. Te abro la calculadora.",
          "Before booking, let's do your ROI calculation first so we can better understand your clinic. I'll open the calculator.",
        ),
        openRoiCalculator: true,
        state: { intent: "none", step: "idle" },
      })
    }

    if (current.intent === "book" && current.step !== "idle" && !hasValidRoiSession) {
      return respond({
        reply: t(
          "Para seguir con la reserva, primero necesito tu ROI. Te abro la calculadora.",
          "To continue with booking, I need your ROI first. I'll open the calculator.",
        ),
        openRoiCalculator: true,
        state: { intent: "none", step: "idle" },
      })
    }

    if (current.intent === "book" && current.step !== "idle") {
      return respond({
        reply: t(
          "Para reservar una cita nueva necesitamos tus datos de contacto completos. Haz la reserva desde la web y yo me encargo de reagendar o cancelar cuando lo necesites.",
          "To book a new appointment we need your full contact details. Please book through the website and I can handle rescheduling or cancellation whenever you need.",
        ),
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
      })
    }

    if (isBookingFlowStep && !hasValidRoiSession) {
      return respond({
        reply: t(
          "Nos falta el ROI para continuar con la reserva. Te abro la calculadora ahora.",
          "We still need the ROI to continue with booking. I'll open the calculator now.",
        ),
        openRoiCalculator: true,
        state: { intent: "none", step: "idle" },
      })
    }

    if (isBookingFlowStep && !hasBookingIntent) {
      return respond({
        reply: t(
          "He perdido el contexto de la reserva. Si quieres, empezamos de nuevo y te propongo horarios.",
          "I lost the booking context. If you want, we can restart and I'll suggest available slots.",
        ),
        state: { intent: "none", step: "idle" },
      })
    }

    if (current.step === "idle" && /\b(clinvetia|clinvetia\.com|que es clinvetia|quien sois|quienes sois|what is clinvetia|who are you)\b/i.test(lower)) {
      return respond({
        reply: t(
          "Clinvetia desarrolla agentes para clínicas veterinarias que organizan citas y mejoran la atención al cliente. Soy Moka, y si quieres te propongo ahora mismo tres horarios para una demo.",
          "Clinvetia builds agents for veterinary clinics that organize appointments and improve client support. I'm Moka, and if you want I can suggest three slots for a demo right now.",
        ),
        state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 1 },
      })
    }

    if (current.step === "idle" && isGreeting(lower) && !wantsBooking && !wantsReschedule && !wantsCancel) {
      return respond({
        reply: t(
          "Hola 😊 Soy Moka. Estoy aquí para ayudarte. ¿Me cuentas un poco de tu clínica y cómo captáis nuevos clientes?",
          "Hi 😊 I'm Moka. I'm here to help you. Can you tell me a bit about your clinic and how you currently attract new clients?",
        ),
        state: { ...current, step: "idle", qualificationStage: 1, objectionAttempts: 0 },
      })
    }

    if (
      current.step === "idle" &&
      !isServiceQuestion(lower) &&
      !wantsBooking &&
      !wantsReschedule &&
      !wantsCancel &&
      !isObjection(lower)
    ) {
      if ((current.qualificationStage || 0) <= 1) {
        return respond({
          reply: t(
            `Ah, interesante lo que me cuentas de "${shortContext(message)}". Cómo estáis gestionando ahora la captación y seguimiento?`,
            `Interesting what you shared about "${shortContext(message)}". How are you handling lead capture and follow-up now?`,
          ),
          state: { ...current, step: "idle", qualificationStage: 2, leadContext: shortContext(message), objectionAttempts: 0 },
        })
      }
      if ((current.qualificationStage || 0) === 2) {
        return respond({
          reply: t(
            "Ya veo. Os está dando los resultados que esperabais o se os escapan oportunidades?",
            "Got it. Is it giving you the results you expected, or are opportunities still slipping through?",
          ),
          state: { ...current, step: "idle", qualificationStage: 3, objectionAttempts: 0 },
        })
      }
      if ((current.qualificationStage || 0) === 3) {
        return respond({
          reply: t(
            "Entiendo. Qué meta de crecimiento tenéis para los próximos 3-6 meses?",
            "Understood. What's your growth target for the next 3-6 months?",
          ),
          state: { ...current, step: "idle", qualificationStage: 4, objectionAttempts: 0 },
        })
      }
      if ((current.qualificationStage || 0) === 4) {
        return respond({
          reply: t(
            "Tiene sentido. Si quieres, te paso el enlace para reservar consultoría y verlo con tu caso. Te lo comparto?",
            "Makes sense. If you want, I can share the link to book a consult and review your case. Should I send it?",
          ),
          state: { ...current, step: "idle", qualificationStage: 5, objectionAttempts: 0 },
        })
      }
      if ((current.qualificationStage || 0) >= 5 && isAffirmative(lower)) {
        return respond({
          reply: t(
            `Genial 🚀 Reserva aquí: ${webBookingUrl}. En cuanto tengas ID de cita, yo te ayudo a reagendar o cancelar cuando lo necesites.`,
            `Great 🚀 Book here: ${webBookingUrl}. As soon as you have your booking ID, I can help you reschedule or cancel anytime.`,
          ),
          state: { ...current, step: "idle", qualificationStage: 6, objectionAttempts: 0 },
        })
      }
    }

    if (current.step === "idle" && isObjection(lower) && !activeBooking) {
      const attempt = Math.min(4, (current.objectionAttempts || 0) + 1)
      if (attempt < 4) {
        return respond({
          reply: objectionReply(attempt, locale),
          state: {
            ...current,
            step: "idle",
            objectionAttempts: attempt,
          },
        })
      }
      return respond({
        reply:
          locale === "en"
            ? `${objectionReply(attempt, locale)} If you're open to it, we can review it in a short free consult.`
            : `${objectionReply(attempt, locale)} Si te encaja, lo vemos en una consultoría breve y sin coste.`,
        state: {
          ...current,
          step: "idle",
          objectionAttempts: attempt,
          qualificationStage: Math.max(current.qualificationStage || 1, 1),
        },
      })
    }

    if (current.step === "idle" && isServiceQuestion(lower)) {
      const aiReply = await generateConversationalReply({
        userMessage: message,
        locale,
        state: current,
        hasActiveBooking: Boolean(activeBooking),
        hasValidRoiSession,
        chatSummary: chatSummaryForCurrentTurn,
        history: historyForCurrentTurn,
      })
      return respond({
        reply: aiReply?.text || t(
          "Buena pregunta. Nuestros agentes atienden mensajes de clientes, priorizan casos y organizan citas para que tu equipo tenga menos carga operativa. Si quieres, te lo explico con un ejemplo real de clinica.",
          "Great question. Our agents handle client messages, prioritize cases, and organize appointments so your team has less operational load. If you want, I can explain with a real clinic example.",
        ),
        provider: aiReply?.provider || "fallback",
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
      })
    }

    if (current.step === "await_timezone") {
      const city = extractCity(message)
      if (!city) {
        return respond({
          reply: t(
            "Para ajustar horario, dime ciudad y país donde estás.",
            "To adjust the schedule, tell me your city and country.",
          ),
          state: current,
        })
      }
      const slots = await buildSlots(3, locale)
      if (!slots.length) {
        return respond({
          reply: t(
            "Ahora mismo no tengo huecos disponibles. Prueba en unos minutos.",
            "I don't have available slots right now. Please try again in a few minutes.",
          ),
          state: { intent: "none", step: "idle", objectionAttempts: 0 },
        })
      }
      return respond({
        reply: t(
          `Vale, te dejo tres opciones para ${city}:\n1) ${slots[0].label}\n2) ${slots[1]?.label || "-"}\n3) ${slots[2]?.label || "-"}\nCuál te encaja mejor?`,
          `Great, here are three options for ${city}:\n1) ${slots[0].label}\n2) ${slots[1]?.label || "-"}\n3) ${slots[2]?.label || "-"}\nWhich one works best for you?`,
        ),
        openCalendar: true,
        state: {
          ...current,
          intent: "book",
          step: "await_slot",
          proposedSlots: slots,
          selectedSlot: null,
          city,
          objectionAttempts: 0,
        },
      })
    }

    if (current.step === "await_booking_id") {
      const bookingIdFromText = extractBookingId(message)
      const bookingTokenFromText = extractBookingToken(message)
      if (!bookingIdFromText && !bookingTokenFromText) {
        return respond({
          reply: t(
            "No detecto un identificador de cita válido. Envíame el ID de cita o el token que recibiste por correo.",
            "I can't detect a valid booking identifier. Send me the booking ID or the token you received by email.",
          ),
          state: current,
        })
      }
      const bookingByIdRaw = bookingIdFromText
        ? await Booking.findOne({
            _id: bookingIdFromText,
            status: { $in: ["pending", "confirmed"] },
            demoExpiresAt: { $gt: new Date() },
          }).lean<{ _id: unknown; accessToken?: unknown } | null>()
        : await Booking.findOne({
            accessToken: bookingTokenFromText,
            status: { $in: ["pending", "confirmed"] },
            demoExpiresAt: { $gt: new Date() },
          }).lean<{ _id: unknown; accessToken?: unknown } | null>()
      const bookingById = Array.isArray(bookingByIdRaw) ? bookingByIdRaw[0] : bookingByIdRaw
      if (!bookingById) {
        return respond({
          reply: t(
            "No encuentro una cita activa con ese identificador. Revísalo y lo intentamos de nuevo.",
            "I can't find an active booking with that identifier. Check it and we'll try again.",
          ),
          state: current,
        })
      }
      const slots = await buildSlots(3, locale)
      if (!slots.length) {
        return respond({
          reply: t(
            "Ahora mismo no tengo huecos disponibles. Prueba en unos minutos.",
            "I don't have available slots right now. Please try again in a few minutes.",
          ),
          state: { intent: "none", step: "idle" },
        })
      }
      return respond({
        reply: t(
          `Ya tengo tu cita ${String(bookingById._id)}. Te propongo 3 horarios:\n1) ${slots[0].label}\n2) ${slots[1]?.label || "-"}\n3) ${slots[2]?.label || "-"}\nElige 1, 2 o 3.`,
          `I found your booking ${String(bookingById._id)}. Here are 3 time options:\n1) ${slots[0].label}\n2) ${slots[1]?.label || "-"}\n3) ${slots[2]?.label || "-"}\nChoose 1, 2, or 3.`,
        ),
        state: {
          intent: "reschedule",
          step: "await_slot",
          proposedSlots: slots,
          selectedSlot: null,
          email: null,
          phone: null,
          targetBookingId: String(bookingById._id),
          targetBookingToken: String(bookingById.accessToken),
          objectionAttempts: 0,
        },
      })
    }

    if (current.step === "await_slot") {
      const slotIndex = extractSlotChoice(message, current.proposedSlots || [])
      if (slotIndex === null) {
        return respond({
          reply: t(
            "Elige una opcion escribiendo 1, 2 o 3 para seguir.",
            "Choose an option by typing 1, 2, or 3 to continue.",
          ),
          state: current,
        })
      }
      const selectedSlot = current.proposedSlots?.[slotIndex] || null
      if (!selectedSlot) {
        return respond({
          reply: t(
            "Ese horario ya no esta disponible. Te paso opciones nuevas.",
            "That slot is no longer available. I'll send new options.",
          ),
          state: { ...current, proposedSlots: await buildSlots(3, locale) },
        })
      }
      return respond({
        reply: t(
          `Genial, te dejo ${selectedSlot.label}. Pásame tu email para enviarte confirmación.`,
          `Great, I'll set ${selectedSlot.label}. Send me your email so I can send confirmation.`,
        ),
        state: {
          ...current,
          selectedSlot,
          step: "await_email",
          objectionAttempts: 0,
        },
      })
    }

    if (current.step === "await_email") {
      const email = extractEmail(message)
      if (!email) {
        return respond({
          reply: t(
            "No veo un email valido. Escribelo completo, por ejemplo nombre@clinica.com.",
            "I can't see a valid email. Write it fully, for example name@clinic.com.",
          ),
          state: current,
        })
      }
      return respond({
        reply: t(
          `Me confirmas si este email está bien: ${email}`,
          `Can you confirm this email is correct: ${email}`,
        ),
        state: {
          ...current,
          email,
          step: "await_email_confirm",
        },
      })
    }

    if (current.step === "await_email_confirm") {
      if (isNegative(lower)) {
        return respond({
          reply: t(
            "Dale, pásame el email correcto y seguimos.",
            "Got it, send me the correct email and we'll continue.",
          ),
          state: {
            ...current,
            email: null,
            step: "await_email",
          },
        })
      }
      if (!isAffirmative(lower)) {
        return respond({
          reply: t(
            "Responde si o no para confirmar el email.",
            "Reply yes or no to confirm the email.",
          ),
          state: current,
        })
      }
      return respond({
        reply: t(
          "Ahora pásame tu teléfono de contacto.",
          "Now send me your contact phone number.",
        ),
        state: {
          ...current,
          step: "await_phone",
          objectionAttempts: 0,
        },
      })
    }

    if (current.step === "await_phone") {
      const phone = extractPhone(message)
      if (!phone) {
        return respond({
          reply: t(
            "No detecto un telefono valido. Enviamelo con prefijo si aplica.",
            "I can't detect a valid phone number. Send it with country code if needed.",
          ),
          state: current,
        })
      }
      return respond({
        reply: t(
          `Me confirmas este teléfono: ${phone}`,
          `Can you confirm this phone number: ${phone}`,
        ),
        state: {
          ...current,
          phone,
          step: "await_phone_confirm",
        },
      })
    }

    if (current.step === "await_phone_confirm") {
      if (isNegative(lower)) {
        return respond({
          reply: t(
            "Dale, pasame el telefono correcto.",
            "Got it, send me the correct phone number.",
          ),
          state: {
            ...current,
            phone: null,
            step: "await_phone",
          },
        })
      }
      if (!isAffirmative(lower)) {
        return respond({
          reply: t(
            "Responde si o no para confirmar el telefono.",
            "Reply yes or no to confirm the phone number.",
          ),
          state: current,
        })
      }

      if (!current.selectedSlot) {
        const slots = await buildSlots(3, locale)
        return respond({
          reply: t(
            "Se perdio el horario seleccionado. Te paso opciones nuevas.",
            "The selected slot was lost. I'll send new options.",
          ),
          state: {
            ...current,
            proposedSlots: slots,
            step: "await_slot",
          },
        })
      }

      if (current.intent === "reschedule") {
        const targetBooking = current.targetBookingId
          ? await Booking.findOne({
              _id: current.targetBookingId,
              status: { $in: ["pending", "confirmed"] },
              demoExpiresAt: { $gt: new Date() },
            })
          : current.targetBookingToken
            ? await Booking.findOne({
                accessToken: current.targetBookingToken,
                status: { $in: ["pending", "confirmed"] },
                demoExpiresAt: { $gt: new Date() },
              })
            : activeBooking
        if (!targetBooking) {
          return respond({
            reply: t(
              `No encuentro una cita activa con ese ID. Si quieres crear una nueva, hazlo desde ${webBookingUrl} y luego te ayudo aquí con cambios.`,
              `I can't find an active booking with that ID. If you want a new one, create it from ${webBookingUrl} and then I can help you with changes here.`,
            ),
            state: { intent: "none", step: "idle" },
          })
        }
        const ok = await rescheduleBooking(String(targetBooking._id), current.selectedSlot)
        if (!ok) {
          const slots = await buildSlots(3, locale)
          return respond({
            reply: t(
              "Ese horario ya no esta libre. Te dejo tres nuevas opciones.",
              "That slot is no longer available. Here are three new options.",
            ),
            state: {
              ...current,
              proposedSlots: slots,
              targetBookingId: current.targetBookingId ?? null,
              step: "await_slot",
            },
          })
        }
        const customerEmail = current.email || null
        const customerPhone = current.phone || null
        let emailDelivered = false
        if (customerEmail && customerPhone) {
          emailDelivered = await sendBookingSummaryEmailFromChat({
            bookingId: String(targetBooking._id),
            date: new Date(current.selectedSlot.date),
            time: current.selectedSlot.time,
            duration: 30,
            email: customerEmail,
            phone: customerPhone,
            sessionToken: sessionToken ?? null,
            roi: activeSession?.roi ?? null,
          })
        }
        return respond({
          reply: emailDelivered
            ? t(
                `Listo, tu cita ${String(targetBooking._id)} quedó reagendada para ${current.selectedSlot.label}. Te he enviado el correo actualizado. ¿Necesitas algo más?`,
                `Done, your booking ${String(targetBooking._id)} was rescheduled to ${current.selectedSlot.label}. I sent your updated confirmation email. Do you need anything else?`,
              )
            : t(
                `Listo, tu cita ${String(targetBooking._id)} quedó reagendada para ${current.selectedSlot.label}. ¿Necesitas algo más?`,
                `Done, your booking ${String(targetBooking._id)} was rescheduled to ${current.selectedSlot.label}. Do you need anything else?`,
              ),
          state: { intent: "none", step: "await_more_help", objectionAttempts: 0 },
          booking: {
            bookingId: String(targetBooking._id),
            accessToken: String(targetBooking.accessToken),
            date: current.selectedSlot.date,
            time: current.selectedSlot.time,
            duration: 30,
          },
        })
      }

      return respond({
        reply: t(
          "Gracias. Para crear citas nuevas necesitamos cerrar tus datos en el formulario web. Yo me quedo disponible para reagendar o cancelar cualquier cita existente.",
          "Thanks. To create new bookings we need to complete your details in the web form. I'm available here to reschedule or cancel any existing booking.",
        ),
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
      })
    }

    if (current.step === "await_more_help") {
      if (isNegative(lower)) {
        return respond({
          reply: t(
            "Gracias por tu tiempo. Cuando quieras, aquí me tienes. Que tengas un gran día.",
            "Thanks for your time. I'm here whenever you need me. Have a great day.",
          ),
          state: { intent: "none", step: "idle", objectionAttempts: 0 },
        })
      }
      return respond({
        reply: t(
          "Cuéntame qué necesitas y te ayudo.",
          "Tell me what you need and I'll help you.",
        ),
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
      })
    }

    if (wantsCancel) {
      if (!activeBooking) {
        return respond({
          reply: t(
            `No veo una cita activa para cancelar. Si quieres crear una nueva, hazlo desde ${webBookingUrl} y luego te ayudo con cambios.`,
            `I don't see an active booking to cancel. If you want a new one, create it from ${webBookingUrl} and then I can help you with changes.`,
          ),
          state: { intent: "none", step: "idle" },
        })
      }
      await clearRoiForBookingContext({
        bookingId: String(activeBooking._id),
        bookingSessionToken: activeBooking.sessionToken ?? null,
        contactSessionToken: activeBooking.sessionToken ?? null,
      })
      await Booking.updateOne({ _id: activeBooking._id }, { $set: { status: "cancelled" } })
      return respond({
        reply: t(
          "He cancelado tu cita activa. Si quieres, te propongo nuevos horarios ahora.",
          "I canceled your active booking. If you want, I can suggest new slots now.",
        ),
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
        booking: null,
      })
    }

    if (wantsReschedule) {
      const bookingIdInMessage = extractBookingId(message)
      const bookingTokenInMessage = extractBookingToken(message)
      if (!bookingIdInMessage && !bookingTokenInMessage) {
        return respond({
          reply: t(
            "Claro. Para reagendar necesito el ID de cita o el token de reserva que te llegó por correo.",
            "Sure. To reschedule, I need the booking ID or booking token you received by email.",
          ),
          state: {
            intent: "reschedule",
            step: "await_booking_id",
            targetBookingId: null,
            targetBookingToken: null,
            proposedSlots: [],
            selectedSlot: null,
            email: null,
            phone: null,
            objectionAttempts: 0,
          },
        })
      }
      const targetBookingRaw = bookingIdInMessage
        ? await Booking.findOne({
            _id: bookingIdInMessage,
            status: { $in: ["pending", "confirmed"] },
            demoExpiresAt: { $gt: new Date() },
          }).lean<{ _id: unknown; accessToken?: unknown } | null>()
        : await Booking.findOne({
            accessToken: bookingTokenInMessage,
            status: { $in: ["pending", "confirmed"] },
            demoExpiresAt: { $gt: new Date() },
          }).lean<{ _id: unknown; accessToken?: unknown } | null>()
      const targetBooking = Array.isArray(targetBookingRaw) ? targetBookingRaw[0] : targetBookingRaw
      if (!targetBooking) {
        return respond({
          reply: t(
            "No encuentro una cita activa con ese identificador. Revísalo y te ayudo a intentarlo de nuevo.",
            "I can't find an active booking with that identifier. Check it and I'll help you try again.",
          ),
          state: {
            intent: "reschedule",
            step: "await_booking_id",
            targetBookingId: null,
            targetBookingToken: null,
            proposedSlots: [],
            selectedSlot: null,
            email: null,
            phone: null,
            objectionAttempts: 0,
          },
        })
      }
      const slots = await buildSlots(3, locale)
      if (!slots.length) {
        return respond({
          reply: t(
            "Ahora mismo no tengo huecos disponibles. Prueba en unos minutos.",
            "I don't have available slots right now. Please try again in a few minutes.",
          ),
          state: { intent: "none", step: "idle" },
        })
      }
      return respond({
        reply: t(
          `Ya tengo tu cita ${String(targetBooking._id)}. Te propongo estas opciones:\n1) ${slots[0].label}\n2) ${slots[1]?.label || "-"}\n3) ${slots[2]?.label || "-"}\nEscribe 1, 2 o 3.`,
          `I found your booking ${String(targetBooking._id)}. Here are your options:\n1) ${slots[0].label}\n2) ${slots[1]?.label || "-"}\n3) ${slots[2]?.label || "-"}\nType 1, 2, or 3.`,
        ),
        state: {
          intent: "reschedule",
          step: "await_slot",
          proposedSlots: slots,
          selectedSlot: null,
          email: null,
          phone: null,
          targetBookingId: String(targetBooking._id),
          targetBookingToken: String(targetBooking.accessToken),
          objectionAttempts: 0,
        },
      })
    }

    if (wantsBooking) {
      if (activeBooking) {
        const currentDate = new Date(activeBooking.date)
        const label = formatDateLabel(currentDate, String(activeBooking.time), locale)
        return respond({
          reply: t(
            `Ya tienes una cita activa para ${label}. ID de cita: ${String(activeBooking._id)}. Si quieres la puedo reagendar o cancelar.`,
            `You already have an active booking for ${label}. Booking ID: ${String(activeBooking._id)}. I can reschedule or cancel it if you want.`,
          ),
          state: { intent: "none", step: "idle", objectionAttempts: 0 },
        })
      }
      return respond({
        reply: t(
          "Para reservar una cita nueva, usa el flujo web de Clinvetia para completar tus datos. Cuando quieras, yo te ayudo a reagendar o cancelar con tu ID de cita.",
          "To book a new appointment, use Clinvetia's web flow to complete your details. Whenever you want, I can help you reschedule or cancel using your booking ID.",
        ),
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
      })
    }

    const fallbackAiReply = await generateConversationalReply({
      userMessage: message,
      locale,
      state: current,
      hasActiveBooking: Boolean(activeBooking),
      hasValidRoiSession,
      chatSummary: chatSummaryForCurrentTurn,
      history: historyForCurrentTurn,
    })
    return respond({
      reply: fallbackAiReply?.text || t(
        "Soy Moka. Puedo explicarte cómo funciona Clinvetia o ayudarte con tu cita. ¿Qué prefieres?",
        "I'm Moka. I can explain how Clinvetia works or help with your booking. Which do you prefer?",
      ),
      provider: fallbackAiReply?.provider || "fallback",
      state: { intent: "none", step: "idle", objectionAttempts: 0 },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json(
      {
        error: "Moka no pudo responder en este momento. Inténtalo de nuevo en unos segundos.",
      },
      { status: 500 },
    )
  }
}
