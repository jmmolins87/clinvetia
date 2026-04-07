import { NextResponse } from "next/server"
import { Types } from "mongoose"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { Booking } from "@/models/Booking"
import { Session } from "@/models/Session"
import { Contact } from "@/models/Contact"
import { sendBrevoEmail } from "@/lib/brevo"
import { leadSummaryEmail } from "@/lib/emails"
import { buildICS } from "@/lib/ics"
import { appendBookingEmailEvent, buildGoogleMeetLink } from "@/lib/booking-communication"
import { rescheduleExistingBooking } from "@/lib/booking-reschedule"
import { clearRoiForBookingContext } from "@/lib/roi-cleanup"
import { DEMO_BOOKABLE_TIME_SLOTS } from "@/lib/demo-schedule"
import { detectChatIntents, wantsRoiCalculator } from "@/lib/chat-intents"
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
import { buildBookingDateTime, formatBookingDate } from "@/lib/booking-date"

const schema = chatAssistantRequestSchema

function isAffirmative(text: string) {
  const normalized = normalizeText(text)
  return /\b(si|correcto|ok|okey|vale|perfecto|confirmo|claro|exacto|de acuerdo|yes|yep|yeah|confirm|sure|correct|esa misma|ese mismo|esa|ese)\b/i.test(normalized) ||
    normalized.includes("mejor si")
}

function isNegative(text: string) {
  return /\b(no|incorrecto|mal|cambiar|otro|equivocado|para nada|wrong|incorrect|change|different|nope|nah)\b/i.test(text)
}

function wantsNewBooking(text: string) {
  return /\b(reservar|reservas|reserva|nueva|nuevo|otra cita|otra demo|book|new booking|new appointment)\b/i.test(text)
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

function referencesDifferentBooking(text: string) {
  return /\b(la de mañana|la del jueves|la del viernes|la del lunes|la del martes|la del miercoles|la del miércoles|la de las cinco|la de las 5|la segunda|la otra|esa no|la buena|la de recepción|la de otra persona|la de mi compañera|la de mi recepcionista|other one|not that one)\b/i.test(text)
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
  return /\b(que es|qué es|que haceis|qué hacéis|que hace clinvetia|qué hace clinvetia|explica|explicame|explícame|como funciona|cómo funciona|agente|agentes|ia|inteligencia artificial|veterinaria|veterinarias|servicio|solucion|solución|what is|explain|how it works|agent|agents|ai|artificial intelligence|veterinary|service|solution)\b/i.test(
    text,
  )
}

function isChannelQuestion(text: string) {
  return /\b(whatsapp|correo|correos|email|emails|mail|mails|responder whatsapp|responder correos|contestar whatsapp|contestar correos|reply to whatsapp|reply to emails|parezca un bot|parecer un bot|sonar humano|human sounding|sound like a bot)\b/i.test(
    text,
  )
}

function isPricingQuestion(text: string) {
  return /\b(cuanto cuesta|cuánto cuesta|precio|precios|tarifa|tarifas|coste|costes|pricing|price|prices|cost)\b/i.test(text)
}

function isDemoInfoRequest(text: string) {
  const normalized = normalizeText(text)
  return (
    /\b(demo|demostracion|demostración)\b/i.test(normalized) &&
    /\b(ver|ver una|ver como|como funciona|como funciona el producto|como funciona clinvetia|mostrar|ensenar|enseñar|explicar|info|informacion|información|understand|see|show|walk me through|how it works|learn more)\b/i.test(normalized) &&
    !/\b(reservar|reserva|agendar|agenda|calendario|calendar|horario|horarios|slot|slots|book|booking|schedule|appointment)\b/i.test(normalized)
  )
}

function isGreeting(text: string) {
  return /\b(hola|buenas|hey|hello|hi|good morning|good afternoon|good evening|buenos dias|buenas tardes|buenas noches)\b/i.test(text)
}

function isSimpleGreeting(text: string) {
  const normalized = normalizeText(text).replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim()
  if (!normalized || normalized.length > 30) return false
  return /^(hola|buenas|hey|hello|hi|buenos dias|buenas tardes|buenas noches)( moka)?$/.test(normalized)
}

function looksLikeBusinessContext(text: string) {
  return /\b(clinica|clínica|veterinaria|veterinario|recepcion|recepción|equipo|clientes|pacientes|whatsapp|correo|instagram|leads|seguimiento|citas|demo|negocio|clinic|team|clients|patients|follow-up|appointments|business)\b/i.test(
    text,
  )
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

function sanitizeState(state?: ChatState | null): ChatState {
  return {
    intent: state?.intent || "none",
    step: state?.step || "idle",
    proposedSlots: state?.proposedSlots || [],
    selectedSlot: state?.selectedSlot || null,
    email: state?.email || null,
    phone: state?.phone || null,
    targetBookingId: state?.targetBookingId || null,
    targetBookingToken: state?.targetBookingToken || null,
    city: state?.city || null,
    objectionAttempts: state?.objectionAttempts || 0,
    qualificationStage: state?.qualificationStage || 0,
    leadContext: state?.leadContext || null,
  }
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

const CHAT_SYSTEM_PROMPT = [
  "Eres Moka, la asistente comercial de Clinvetia para clínicas veterinarias.",
  "Tu objetivo es responder bien, sonar humana y mover la conversación hacia una demo o consultoría cuando encaje.",
  "Si detectas interés claro, dolor operativo o una pregunta sobre capacidades, ofrece una demo de forma natural en el mismo mensaje o en el siguiente.",
  "No esperes demasiado para proponer ver el caso aplicado a la clínica si ya hay contexto suficiente.",
  "Si el usuario pregunta por la calculadora ROI, explícale de forma simple qué datos usa, qué estima y para qué sirve antes o después de abrirla según encaje.",
  "No eres un chatbot genérico ni hablas como una consultora corporativa.",
  "No menciones IA, herramientas, APIs, prompts ni procesos internos.",
  "Habla de forma cercana, comercial, breve y segura.",
  "Normalmente usa 1 a 3 frases y una sola pregunta por mensaje.",
  "Responde primero a la duda real del usuario antes de empujar el siguiente paso.",
  "Si el usuario solo saluda, saluda de forma natural y haz una pregunta suave.",
  "Valida la fricción del usuario antes de redirigir y usa lo que dijo como contexto.",
  "Si hay objeción, responde con empatía y vuelve a abrir con curiosidad o un ejemplo práctico.",
  "Evita frases robóticas: 'Excelente pregunta', 'No entendí tu mensaje', 'Te explico', 'Interesante. Me dices...'.",
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
    isSimpleGreeting(params.userMessage) ? "simple_greeting=true" : null,
    isChannelQuestion(params.userMessage) ? "channel_question=true" : null,
    isPricingQuestion(params.userMessage) ? "pricing_question=true" : null,
    isServiceQuestion(params.userMessage) ? "service_question=true" : null,
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
  operatorEmail?: string | null
  subject?: string
  emailEventCategory?: string
  emailMessage?: string
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
  const dateLabel = formatBookingDate(params.date, "es-ES", { weekday: "long", day: "numeric", month: "long" })
  const meetingLink = buildGoogleMeetLink(params.bookingId)
  const start = buildBookingDateTime(params.date, params.time)
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
    timeZone: "Europe/Madrid",
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

  const subject = params.subject || "Tu cita está confirmada"
  const roiForEmail = params.roi
    ? {
        monthlyPatients: params.roi.monthlyPatients ?? undefined,
        averageTicket: params.roi.averageTicket ?? undefined,
        conversionLoss: params.roi.conversionLoss ?? undefined,
        roi: params.roi.roi ?? undefined,
      }
    : null
  const message = params.emailMessage || "Reserva creada desde chat asistido"
  const htmlContent = leadSummaryEmail({
    brandName,
    nombre: name,
    email: params.email,
    telefono: params.phone,
    clinica: "Pendiente de completar",
    mensaje: message,
    supportEmail,
    booking: {
      dateLabel,
      timeLabel: params.time,
      duration: params.duration,
      meetingLink,
    },
    roi: roiForEmail,
  })

  const deliveryTargets = Array.from(
    new Set(
      [params.email, supportEmail, params.operatorEmail].filter(
        (value): value is string => Boolean(value)
      )
    )
  )
  let allDelivered = true
  for (const target of deliveryTargets) {
    const emailResult = await sendBrevoEmail({
      to: [{ email: target, name: target === params.email ? name : brandName }],
      subject,
      htmlContent,
      attachments: [{
        name: "clinvetia-cita.ics",
        content: Buffer.from(ics).toString("base64"),
        contentType: "text/calendar",
      }],
      replyTo: { email: supportEmail },
    })

    allDelivered &&= emailResult.ok

    await appendBookingEmailEvent({
      bookingId: params.bookingId,
      category: params.emailEventCategory || "customer_summary",
      subject,
      intendedRecipient: params.email ?? null,
      deliveredTo: target,
      status: emailResult.ok ? "sent" : "failed",
      error: emailResult.ok ? null : emailResult.error ?? "Email delivery failed",
      message,
      googleMeetLink: meetingLink,
    })
  }

  return allDelivered
}

async function findRescheduleTarget(params: {
  bookingId?: string | null
  bookingToken?: string | null
  email?: string | null
}) {
  if (params.bookingId) {
    if (!Types.ObjectId.isValid(params.bookingId)) return null
    return Booking.findOne({
      _id: params.bookingId,
      status: { $in: ["pending", "confirmed"] },
      demoExpiresAt: { $gt: new Date() },
    }).lean<{ _id: unknown; accessToken: string; date: Date; time: string; duration: number } | null>()
  }

  if (params.bookingToken) {
    return Booking.findOne({
      accessToken: params.bookingToken,
      status: { $in: ["pending", "confirmed"] },
      demoExpiresAt: { $gt: new Date() },
    }).lean<{ _id: unknown; accessToken: string; date: Date; time: string; duration: number } | null>()
  }

  if (params.email) {
    const contacts = await Contact.find({ email: params.email.toLowerCase() })
      .sort({ createdAt: -1 })
      .select("bookingId")
      .lean<Array<{ bookingId?: unknown }>>()

    const bookingIds = contacts
      .map((contact) => (contact.bookingId ? String(contact.bookingId) : null))
      .filter(Boolean)

    if (!bookingIds.length) return null

    return Booking.findOne({
      _id: { $in: bookingIds },
      status: { $in: ["pending", "confirmed"] },
      demoExpiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .lean<{ _id: unknown; accessToken: string; date: Date; time: string; duration: number } | null>()
  }

  return null
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
          console.info("N8N chat webhook accepted", {
            requestId: payload.requestId,
            status: n8nResult.status,
          })
          return NextResponse.json(externalResponse.data)
        }

        console.error("N8N chat webhook returned invalid payload", {
          requestId: payload.requestId,
          status: n8nResult.status,
          data: n8nResult.data,
        })
      } else if (n8nResult) {
        console.error("N8N chat webhook failed", {
          requestId: payload.requestId,
          status: n8nResult.status,
          error: n8nResult.error,
          data: n8nResult.data,
        })
      }
    }

    await dbConnect()

    const t = (es: string, en: string) => (locale === "en" ? en : es)
    const message = parsed.message.trim()
    const lower = message.toLowerCase()
    const { wantsBooking, wantsReschedule, wantsCancel } = detectChatIntents(message)
    const webBookingUrl = `${(process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "").replace(/\/+$/, "")}/demo`
    const rawSessionToken = typeof parsed.sessionToken === "string" ? parsed.sessionToken.trim() : ""
    const sessionToken = rawSessionToken.length > 0 ? rawSessionToken : null

    const activeBooking = await findActiveBooking({
      sessionToken,
      bookingToken: parsed.bookingToken,
    })

    const activeSession = sessionToken
      ? await Session.findOne({ token: sessionToken, expiresAt: { $gt: new Date() } })
          .select("token expiresAt roi chatSummary chatHistory chatState")
          .lean<{
            token: string
            expiresAt: Date
            chatSummary?: string | null
            chatState?: ChatState | null
            chatHistory?: ChatHistoryMessage[]
            roi?: {
              monthlyPatients?: number | null
              averageTicket?: number | null
              conversionLoss?: number | null
              roi?: number | null
            } | null
          } | null>()
      : null
    const current = sanitizeState(parsed.state ?? activeSession?.chatState)
    const incomingHistory = sanitizeHistory(parsed.history)
    const persistedHistory = sanitizeHistory(activeSession?.chatHistory)
    const effectiveHistory = incomingHistory.length > 0 ? incomingHistory : persistedHistory
    const compactedBeforeReply = compactHistoryAndSummary(withCurrentUserMessage(effectiveHistory, message), activeSession?.chatSummary ?? "")
    const historyForCurrentTurn = compactedBeforeReply.history
    const chatSummaryForCurrentTurn = compactedBeforeReply.summary

    if (activeSession?.token) {
      await Session.updateOne(
        { token: activeSession.token, expiresAt: { $gt: new Date() } },
        { $set: { chatHistory: historyForCurrentTurn, chatSummary: chatSummaryForCurrentTurn, chatState: current } },
      )
    }

    const hasValidRoiSession = hasCompleteRoi(activeSession)
    const isBookingFlowStep = ["await_timezone", "await_booking_id", "await_booking_confirm", "await_slot", "await_email", "await_email_confirm", "await_phone", "await_phone_confirm"].includes(
      current.step || "",
    )
    const hasManagedBookingIntent = current.intent === "book" || current.intent === "reschedule" || current.intent === "cancel"

    const respond = async (payload: Record<string, unknown>, init?: ResponseInit) => {
      const replyText = typeof payload.reply === "string" ? payload.reply.replace(/\s+/g, " ").trim() : ""
      if (activeSession?.token && replyText) {
        const nextState = sanitizeState((payload.state as ChatState | undefined) ?? current)
        const compactedAfterReply = compactHistoryAndSummary(
          [...historyForCurrentTurn, { role: "assistant" as const, content: replyText, timestamp: new Date().toISOString() }],
          chatSummaryForCurrentTurn,
        )
        await Session.updateOne(
          { token: activeSession.token, expiresAt: { $gt: new Date() } },
          { $set: { chatHistory: compactedAfterReply.history, chatSummary: compactedAfterReply.summary, chatState: nextState } },
        )
      }
      return NextResponse.json(payload, init)
    }

    const respondWithActiveBooking = () => {
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

    if (current.step === "idle" && /\b(clinvetia|clinvetia\.com|que es clinvetia|quien sois|quienes sois|what is clinvetia|who are you)\b/i.test(lower)) {
      return respond({
        reply: t(
          "Clinvetia desarrolla agentes para clínicas veterinarias que organizan citas y mejoran la atención al cliente. Soy Moka, y si quieres te propongo ahora mismo tres horarios para una demo.",
          "Clinvetia builds agents for veterinary clinics that organize appointments and improve client support. I'm Moka, and if you want I can suggest three slots for a demo right now.",
        ),
        state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 1, leadContext: "__demo_offer__" },
      })
    }

    if (current.step === "idle" && isPricingQuestion(lower) && (isServiceQuestion(lower) || /\b(clinvetia|que haceis|qué hacéis|que hace clinvetia|qué hace clinvetia)\b/i.test(lower))) {
      return respond({
        reply: t(
          "Clinvetia desarrolla agentes para clínicas veterinarias que ayudan con atención al cliente, seguimiento y organización de citas. El precio depende del volumen y de lo que necesite tu clínica, así que no te voy a inventar una tarifa aquí. Si quieres, lo vemos en una demo breve y te enseño qué encajaría en vuestro caso.",
          "Clinvetia builds agents for veterinary clinics that help with client support, follow-up, and appointment organization. Pricing depends on your clinic's volume and needs, so I won't invent a fee here. If you want, we can review it in a short demo and I can show you what would fit your clinic.",
        ),
        state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 1, leadContext: "__demo_offer__" },
      })
    }

    if (current.step === "idle" && isChannelQuestion(lower)) {
      return respond({
        reply: t(
          "Sí. Clinvetia puede responder WhatsApp y correo con tono natural, seguir conversaciones y dejar claro cuándo conviene pasar a una persona del equipo. Si quieres, lo vemos con un ejemplo de vuestra clínica en una demo breve.",
          "Yes. Clinvetia can reply on WhatsApp and email with a natural tone, keep conversations moving, and make it clear when a human from your team should step in. If you want, we can look at it with an example from your clinic in a short demo.",
        ),
        state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 1, leadContext: "__demo_offer__" },
      })
    }

    if (current.step === "idle" && isDemoInfoRequest(message) && !wantsReschedule && !wantsCancel) {
      return respond({
        reply: t(
          "Sí. En una demo te enseño cómo entra una consulta, cómo Clinvetia responde, cuándo pasa a tu equipo y cómo queda todo registrado. Si quieres, te cuento primero un caso práctico de clínica o, si ya te encaja, te ayudo luego a agendarla.",
          "Yes. In a demo I can show you how an inquiry comes in, how Clinvetia responds, when it hands off to your team, and how everything gets recorded. If you want, I can first walk you through a practical clinic example or, if it already fits, help you schedule it afterward.",
        ),
        state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 1, leadContext: "__demo_offer__" },
      })
    }

    if (current.step === "idle" && isServiceQuestion(lower) && wantsBooking && !wantsReschedule && !wantsCancel) {
      return respond({
        reply: t(
          "Clinvetia desarrolla agentes para clínicas veterinarias que ayudan con atención al cliente, seguimiento y organización de citas. Si quieres, después de explicártelo te ayudo también a reservar una demo.",
          "Clinvetia builds agents for veterinary clinics that help with client support, follow-up, and appointment organization. If you want, after I explain it I can also help you book a demo.",
        ),
        state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 1, leadContext: "__demo_offer__" },
      })
    }

    if (current.step === "idle" && /\b(tengo dos citas|tengo 2 citas|reserv[eé] dos citas|tengo varias citas)\b/i.test(lower)) {
      return respond({
        reply: t(
          "Puedo ayudarte con eso. Pásame el correo con el que reservaste o el ID de una de las citas y vemos cuál quieres gestionar.",
          "I can help with that. Send me the email used for the booking or the ID of one of the bookings and we'll see which one you want to manage.",
        ),
        state: { intent: "reschedule", step: "await_booking_id", objectionAttempts: 0 },
      })
    }

    if (wantsRoiCalculator(message)) {
      return respond({
        reply: t(
          "Claro. Te abro de nuevo la calculadora ROI.",
          "Sure. I'll reopen the ROI calculator for you.",
        ),
        openRoiCalculator: true,
        state: { ...current, step: "idle" },
      })
    }

    if (activeBooking && current.intent === "book" && current.step !== "idle") {
      return respondWithActiveBooking()
    }

    if (activeBooking && current.step === "idle" && wantsBooking && !wantsReschedule && !wantsCancel) {
      return respondWithActiveBooking()
    }

    if (current.step === "idle" && wantsBooking && !wantsReschedule && !wantsCancel && !hasValidRoiSession) {
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

    if (isBookingFlowStep && current.intent === "book" && !hasValidRoiSession) {
      return respond({
        reply: t(
          "Nos falta el ROI para continuar con la reserva. Te abro la calculadora ahora.",
          "We still need the ROI to continue with booking. I'll open the calculator now.",
        ),
        openRoiCalculator: true,
        state: { intent: "none", step: "idle" },
      })
    }

    if (isBookingFlowStep && !hasManagedBookingIntent) {
      return respond({
        reply: t(
          "He perdido el contexto de la reserva. Si quieres, empezamos de nuevo y te propongo horarios.",
          "I lost the booking context. If you want, we can restart and I'll suggest available slots.",
        ),
        state: { intent: "none", step: "idle" },
      })
    }

    if (current.step === "idle" && isGreeting(lower) && !wantsBooking && !wantsReschedule && !wantsCancel) {
      return respond({
        reply: t(
          isSimpleGreeting(message)
            ? "Hola 😊 Soy Moka. Encantada. ¿Qué te gustaría ver o resolver hoy?"
            : "Hola 😊 Soy Moka. Encantada. Cuéntame, ¿qué te gustaría ver o resolver en vuestra clínica?",
          isSimpleGreeting(message)
            ? "Hi 😊 I'm Moka. Nice to meet you. What would you like to explore or solve today?"
            : "Hi 😊 I'm Moka. Nice to meet you. Tell me, what would you like to explore or solve for your clinic?",
        ),
        state: { ...current, step: "idle", qualificationStage: 1, objectionAttempts: 0 },
      })
    }

    if (current.step === "idle" && current.leadContext === "__demo_offer__" && (isAffirmative(lower) || wantsNewBooking(lower) || (wantsBooking && !wantsReschedule && !wantsCancel))) {
      return respond({
        reply: t(
          "Perfecto. Antes de enseñarte horarios, hagamos tu cálculo ROI para orientar mejor la demo. Te abro la calculadora.",
          "Perfect. Before I show you the time slots, let's do your ROI calculation so we can tailor the demo better. I'll open the calculator.",
        ),
        openRoiCalculator: true,
        state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 0, leadContext: null },
      })
    }

    if (
      current.step === "idle" &&
      !isSimpleGreeting(message) &&
      !isServiceQuestion(lower) &&
      !wantsBooking &&
      !wantsReschedule &&
      !wantsCancel &&
      !isObjection(lower)
    ) {
      if ((current.qualificationStage || 0) <= 1) {
        if (!looksLikeBusinessContext(message) && message.trim().length < 24) {
          return respond({
            reply: t(
              "Claro. Cuéntame un poco más y te digo si encaja con lo que hace Clinvetia.",
              "Sure. Tell me a bit more and I'll tell you whether it fits what Clinvetia does.",
            ),
            state: { ...current, step: "idle", qualificationStage: 1, objectionAttempts: 0 },
          })
        }
        return respond({
          reply: t(
            `Tiene sentido. Por lo que me cuentas de "${shortContext(message)}", ¿cómo estáis gestionando ahora la captación y el seguimiento?`,
            `That makes sense. Based on what you shared about "${shortContext(message)}", how are you handling lead capture and follow-up right now?`,
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
      const emailFromText = extractEmail(message)
      const saysNoId = /\b(no tengo (el )?id|no se (mi |el )?id|no sé (mi |el )?id|no tengo el identificador|no lo tengo|no encuentro el id|no encuentro mi id|no encuentro el identificador)\b/i.test(lower)
      const wantsAbortLookup = /\b(d[eé]jalo|olvida(lo|la)?|da igual|forget it|never mind|leave it|drop it)\b/i.test(lower)
      const wantsFallbackNewBooking =
        /\b(si no|if not|otherwise)\b/i.test(lower) &&
        /\b(otra|nuevo|nueva|another|new)\b/i.test(lower) &&
        (/\b(reserva|reservar|demo|cita|book)\b/i.test(lower) || wantsNewBooking(lower))
      const actionLabel = current.intent === "cancel"
        ? t("cancelar", "cancel")
        : t("reagendar", "reschedule")
      if ((current.intent === "cancel" || current.intent === "reschedule") && wantsAbortLookup) {
        return respond({
          reply: t(
            "Sin problema. Lo dejamos aquí. Si luego quieres retomarlo o prefieres reservar una nueva, te ayudo.",
            "No problem. We'll leave it here. If you want to pick it up later or prefer to book a new one, I'll help.",
          ),
          state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 0, leadContext: null },
        })
      }
      if ((current.intent === "cancel" || current.intent === "reschedule") && isAffirmative(lower) && wantsNewBooking(lower)) {
        return respond({
          reply: t(
            "Perfecto. Para reservar una nueva, hagamos primero tu cálculo ROI. Te abro la calculadora.",
            "Perfect. To book a new one, let's do your ROI first. I'll open the calculator.",
          ),
          openRoiCalculator: true,
          state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 0, leadContext: null },
        })
      }
      if ((current.intent === "cancel" || current.intent === "reschedule") && /\b(espera|wait)\b/i.test(lower) && isNegative(lower)) {
        return respond({
          reply: t(
            "Sin problema. Dejamos este cambio aquí. Si más adelante quieres retomarlo o reservar una nueva, te ayudo.",
            "No problem. We'll leave it here. If you want to pick it up later or book a new one, I'll help.",
          ),
          state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 0, leadContext: null },
        })
      }
      if ((current.intent === "cancel" || current.intent === "reschedule") && /\b(al final no|mejor otra|mejor una nueva|bah|olvida esa)\b/i.test(lower) && wantsNewBooking(lower)) {
        return respond({
          reply: t(
            "Perfecto. Si prefieres una nueva, hagamos primero tu cálculo ROI. Te abro la calculadora.",
            "Perfect. If you prefer a new one, let's do your ROI calculation first. I'll open the calculator.",
          ),
          openRoiCalculator: true,
          state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 0, leadContext: null },
        })
      }
      if ((current.intent === "cancel" || current.intent === "reschedule") && wantsNewBooking(lower) && !bookingIdFromText && !bookingTokenFromText && !emailFromText) {
        return respond({
          reply: t(
            "Perfecto. Si prefieres reservar una nueva, hagamos primero tu cálculo ROI. Te abro la calculadora.",
            "Perfect. If you'd rather book a new one, let's do your ROI calculation first. I'll open the calculator.",
          ),
          openRoiCalculator: true,
          state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 0, leadContext: null },
        })
      }
      if ((current.intent === "cancel" || current.intent === "reschedule") && /\b(mejor otra|otra|book another one|another one)\b/i.test(lower) && !bookingIdFromText && !bookingTokenFromText && !emailFromText) {
        return respond({
          reply: t(
            "Perfecto. Si prefieres reservar una nueva, hagamos primero tu cálculo ROI. Te abro la calculadora.",
            "Perfect. If you'd rather book a new one, let's do your ROI calculation first. I'll open the calculator.",
          ),
          openRoiCalculator: true,
          state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 0, leadContext: null },
        })
      }
      if ((current.intent === "cancel" || current.intent === "reschedule") && wantsFallbackNewBooking && !bookingIdFromText && !bookingTokenFromText && !emailFromText) {
        return respond({
          reply: t(
            "Perfecto. Si prefieres reservar una nueva, hagamos primero tu cálculo ROI. Te abro la calculadora.",
            "Perfect. If you'd rather book a new one, let's do your ROI calculation first. I'll open the calculator.",
          ),
          openRoiCalculator: true,
          state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 0, leadContext: null },
        })
      }
      if ((current.intent === "cancel" || current.intent === "reschedule") && /\b(si no la encuentras|si no aparece|si no sale|si no existe|si no la ves)\b/i.test(lower) && wantsNewBooking(lower)) {
        return respond({
          reply: t(
            "Perfecto. Si no aparece esa cita, te ayudo a reservar una nueva. Empecemos con tu cálculo ROI y te abro la calculadora.",
            "Perfect. If that booking doesn't show up, I'll help you book a new one. Let's start with your ROI calculation and I'll open the calculator.",
          ),
          openRoiCalculator: true,
          state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 0, leadContext: null },
        })
      }
      if (/\b(ese correo ya no lo uso|ya no uso ese correo|no uso ya ese correo|ya no tengo acceso a ese correo)\b/i.test(lower)) {
        return respond({
          reply: t(
            "Perfecto. Entonces pásame el ID de la cita. Si no lo tienes, dime otro correo con el que creas que pudiste reservarla.",
            "Got it. Then send me the booking ID. If you don't have it, tell me another email you may have used for the booking.",
          ),
          state: current,
        })
      }
      if (/\b(igual fue con otro correo|igual esta con el correo del trabajo|igual está con el correo del trabajo|la del curro|la del mail del trabajo|la del correo del trabajo|quiz[aá] fue con otro correo|puede que fuera con otro correo|correo de recepcion|correo de recepción|la de recepción|la de secretaria|la de secretaría|la de otra persona|a nombre de otra persona|lo reservo mi recepcionista|lo reserv[oó] mi recepcionista|la reserv[oó] mi recepcionista|lo reservo mi secretaria|lo reserv[oó] mi secretaria|with my receptionist|with our receptionist|my receptionist booked it|our receptionist booked it|with my secretary|my secretary booked it|with another email|maybe another email|maybe it was another email|with my work email|with our work email|under another person's email)\b/i.test(lower)) {
        return respond({
          reply: t(
            "Perfecto. Entonces pásame ese otro correo o, si te resulta más fácil, el ID de la cita y lo reviso contigo.",
            "Got it. Then send me that other email or, if it's easier, the booking ID and I'll check it with you.",
          ),
          state: current,
        })
      }
      if (/\b(no encuentro el mail|no encuentro el correo|no sé qué correo use|no se que correo use|no recuerdo el correo|no me acuerdo del correo)\b/i.test(lower)) {
        return respond({
          reply: t(
            "No pasa nada. Si no recuerdas el correo, pásame el ID de la cita. Y si tampoco lo tienes, dime otro correo que creas que pudiste usar y lo revisamos.",
            "No problem. If you don't remember the email, send me the booking ID. And if you don't have it either, tell me another email you may have used and we'll check it.",
          ),
          state: current,
        })
      }
      if (saysNoId) {
        return respond({
          reply: t(
            "No pasa nada. Si no tienes el ID, pásame el correo con el que reservaste y lo reviso contigo.",
            "No problem. If you don't have the booking ID, send me the email used for the booking and I'll check it with you.",
          ),
          state: current,
        })
      }
      if (!bookingIdFromText && !bookingTokenFromText && !emailFromText) {
        if (/\bid\b/i.test(lower)) {
          return respond({
            reply: t(
              "Ese ID no parece válido. Pásame el ID correcto de la cita o, más fácil, el correo con el que reservaste.",
              "That booking ID doesn't look valid. Send me the correct booking ID or, easier, the email used for the booking.",
            ),
            state: current,
          })
        }
        return respond({
          reply: t(
            "No detecto una referencia válida. Envíame el ID de la cita o el correo con el que reservaste.",
            "I can't detect a valid reference. Send me the booking ID or the email used for the booking.",
          ),
          state: current,
        })
      }
      const bookingByIdRaw = await findRescheduleTarget({
        bookingId: bookingIdFromText,
        bookingToken: bookingTokenFromText,
        email: emailFromText,
      })
      const bookingById = Array.isArray(bookingByIdRaw) ? bookingByIdRaw[0] : bookingByIdRaw
      if (!bookingById) {
        if (bookingIdFromText || bookingTokenFromText) {
          return respond({
            reply: t(
              "No encuentro ninguna cita activa con ese ID. Pásame el correo con el que hiciste la reserva y la busco por ahí.",
              "I can't find any active booking with that ID. Send me the email used for the booking and I'll look it up that way.",
            ),
            state: current,
          })
        }
        return respond({
          reply: t(
            "No encuentro una cita activa con ese correo. Si tienes el ID de la cita, pásamelo y la reviso. Y si no aparece, te ayudo a reservar una nueva ahora mismo.",
            "I can't find an active booking with that email. If you have the booking ID, send it to me and I'll check it. And if it still doesn't show up, I can help you book a new one right away.",
          ),
          state: current,
        })
      }
      const currentDate = new Date(bookingById.date)
      const label = formatDateLabel(currentDate, bookingById.time, locale)
      return respond({
        reply: t(
          `He encontrado tu cita ${String(bookingById._id)} para ${label}. ¿Es esta la cita que quieres ${actionLabel}?`,
          `I found your booking ${String(bookingById._id)} for ${label}. Is this the booking you want to ${actionLabel}?`,
        ),
        state: {
          intent: current.intent === "cancel" ? "cancel" : "reschedule",
          step: "await_booking_confirm",
          proposedSlots: [],
          selectedSlot: null,
          email: null,
          phone: null,
          targetBookingId: String(bookingById._id),
          targetBookingToken: bookingById.accessToken,
          objectionAttempts: 0,
        },
      })
    }

    if (current.step === "await_booking_confirm") {
      if (referencesDifferentBooking(lower)) {
        return respond({
          reply: t(
            "Entendido. Entonces pásame el ID de esa otra cita o el correo con el que se reservó y la buscamos.",
            "Understood. Then send me the ID of that other booking or the email used for it and we'll look it up.",
          ),
          state: {
            intent: current.intent === "cancel" ? "cancel" : "reschedule",
            step: "await_booking_id",
            proposedSlots: [],
            selectedSlot: null,
            email: null,
            phone: null,
            targetBookingId: null,
            targetBookingToken: null,
            objectionAttempts: 0,
          },
        })
      }

      if (isNegative(lower)) {
        return respond({
          reply: t(
            "Perfecto. Envíame entonces el ID de la cita o el correo con el que hiciste la reserva.",
            "Perfect. Then send me the booking ID or the email used for the booking.",
          ),
          state: {
            intent: current.intent === "cancel" ? "cancel" : "reschedule",
            step: "await_booking_id",
            proposedSlots: [],
            selectedSlot: null,
            email: null,
            phone: null,
            targetBookingId: null,
            targetBookingToken: null,
            objectionAttempts: 0,
          },
        })
      }

      if (!isAffirmative(lower)) {
        return respond({
          reply: t(
            current.intent === "cancel"
              ? "Respóndeme si o no y, si es correcta, la cancelo."
              : "Respóndeme si o no y, si es correcta, te abro el calendario para elegir la nueva fecha.",
            current.intent === "cancel"
              ? "Reply yes or no and, if it's correct, I'll cancel it."
              : "Reply yes or no and, if it's correct, I'll open the calendar so you can choose the new date.",
          ),
          state: current,
        })
      }

      const targetBooking = await findRescheduleTarget({
        bookingId: current.targetBookingId,
        bookingToken: current.targetBookingToken,
      })
      if (!targetBooking) {
        return respond({
          reply: t(
            "Esa cita ya no está activa. Si quieres, buscamos otra con tu correo o me pasas otro ID.",
            "That booking is no longer active. If you want, we can look for another one with your email or you can send me another ID.",
          ),
          state: {
            intent: current.intent === "cancel" ? "cancel" : "reschedule",
            step: "await_booking_id",
            proposedSlots: [],
            selectedSlot: null,
            email: null,
            phone: null,
            targetBookingId: null,
            targetBookingToken: null,
            objectionAttempts: 0,
          },
        })
      }

      if (current.intent === "cancel") {
        await clearRoiForBookingContext({
          bookingId: String(targetBooking._id),
          bookingSessionToken: null,
          contactSessionToken: null,
        })
        await Booking.updateOne({ _id: targetBooking._id }, { $set: { status: "cancelled" } })
        return respond({
          reply: t(
            `Listo. He cancelado la cita ${String(targetBooking._id)}. Si quieres, también puedo ayudarte a reservar una nueva.`,
            `Done. I cancelled booking ${String(targetBooking._id)}. If you want, I can also help you book a new one.`,
          ),
          state: { intent: "none", step: "await_more_help", objectionAttempts: 0 },
          booking: null,
        })
      }

      return respond({
        reply: t(
          "Perfecto. Te abro el calendario para que elijas la nueva fecha y hora.",
          "Perfect. I'll open the calendar so you can choose the new date and time.",
        ),
        openCalendar: true,
        state: {
          intent: "reschedule",
          step: "idle",
          proposedSlots: [],
          selectedSlot: null,
          email: null,
          phone: null,
          targetBookingId: String(targetBooking._id),
          targetBookingToken: targetBooking.accessToken,
          objectionAttempts: 0,
        },
        booking: {
          bookingId: String(targetBooking._id),
          accessToken: targetBooking.accessToken,
          date: targetBooking.date.toISOString(),
          time: targetBooking.time,
          duration: targetBooking.duration,
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
              `No encuentro una cita activa con ese ID. Si quieres, puedo ayudarte a reservar una nueva cita desde aquí o puedes hacerlo directamente en ${webBookingUrl}. Como prefieras, te acompaño.`,
              `I can't find an active booking with that ID. If you want, I can help you book a new appointment from here, or you can do it directly at ${webBookingUrl}. Either way, I can help.`,
            ),
            state: { intent: "none", step: "idle" },
          })
        }
        const rescheduled = await rescheduleExistingBooking({
          bookingId: String(targetBooking._id),
          date: new Date(`${current.selectedSlot.date}T00:00:00.000Z`),
          time: current.selectedSlot.time,
          duration: 30,
        })
        if (!rescheduled.ok) {
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
        const nextBooking = rescheduled.booking
        const customerEmail = current.email || null
        const customerPhone = current.phone || null
        let emailDelivered = false
        if (customerEmail && customerPhone) {
          emailDelivered = await sendBookingSummaryEmailFromChat({
            bookingId: nextBooking.id,
            date: nextBooking.date,
            time: nextBooking.time,
            duration: nextBooking.duration,
            email: customerEmail,
            phone: customerPhone,
            operatorEmail: nextBooking.operatorEmail ?? null,
            subject: "Tu demo ha sido reagendada",
            emailEventCategory: "booking_rescheduled",
            emailMessage: `Cita reagendada desde la reserva ${rescheduled.previousBookingId}.`,
            sessionToken: sessionToken ?? null,
            roi: activeSession?.roi ?? null,
          })
        }
        return respond({
          reply: emailDelivered
            ? t(
                `Listo, tu nueva cita ${nextBooking.id} quedó reagendada para ${current.selectedSlot.label}. Te he enviado el correo actualizado. ¿Necesitas algo más?`,
                `Done, your new booking ${nextBooking.id} was rescheduled to ${current.selectedSlot.label}. I sent your updated confirmation email. Do you need anything else?`,
              )
            : t(
                `Listo, tu nueva cita ${nextBooking.id} quedó reagendada para ${current.selectedSlot.label}. ¿Necesitas algo más?`,
                `Done, your new booking ${nextBooking.id} was rescheduled to ${current.selectedSlot.label}. Do you need anything else?`,
              ),
          state: { intent: "none", step: "await_more_help", objectionAttempts: 0 },
          booking: {
            bookingId: nextBooking.id,
            accessToken: nextBooking.accessToken,
            date: nextBooking.date.toISOString(),
            time: nextBooking.time,
            duration: nextBooking.duration,
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
        const bookingIdInMessage = extractBookingId(message)
        const bookingTokenInMessage = extractBookingToken(message)
        const emailInMessage = extractEmail(message)
        const mentionsId = /\bid\b/i.test(lower)
        const saysNoId = /\b(no tengo (el )?id|no se (mi |el )?id|no sé (mi |el )?id|no tengo el identificador|no lo tengo|no encuentro el id|no encuentro mi id|no encuentro el identificador)\b/i.test(lower)
        const saysNoEmail = /\b(no recuerdo el correo|no encuentro el correo|no encuentro el mail|no recuerdo el mail|no se que correo use|no sé qué correo usé|no me acuerdo del correo)\b/i.test(lower)
        if (!bookingIdInMessage && !bookingTokenInMessage && !emailInMessage) {
          if (saysNoEmail) {
            return respond({
              reply: t(
                "No pasa nada. Si no recuerdas el correo, pásame el ID de la cita. Y si tampoco lo tienes, dime otro correo que creas que pudiste usar y lo revisamos.",
                "No problem. If you don't remember the email, send me the booking ID. And if you don't have it either, tell me another email you may have used and we'll check it.",
              ),
              state: {
                intent: "cancel",
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
          if (saysNoId) {
            return respond({
              reply: t(
                "No pasa nada. Si no tienes el ID, pásame el correo con el que reservaste y lo reviso contigo.",
                "No problem. If you don't have the booking ID, send me the email used for the booking and I'll check it with you.",
              ),
              state: {
                intent: "cancel",
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
          if (mentionsId) {
            return respond({
              reply: t(
                "Ese ID no parece válido. Pásame el ID correcto de la cita o, si te va mejor, el correo con el que reservaste y lo reviso contigo.",
                "That booking ID doesn't look valid. Send me the correct booking ID or, if it's easier, the email used for the booking.",
              ),
              state: {
                intent: "cancel",
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
          return respond({
            reply: t(
              "Claro, te ayudo con eso. Para cancelar necesito el ID de la cita o el correo con el que reservaste.",
              "Sure. To cancel, I need the booking ID or the email used for the booking.",
            ),
            state: {
              intent: "cancel",
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

        const targetBookingRaw = await findRescheduleTarget({
          bookingId: bookingIdInMessage,
          bookingToken: bookingTokenInMessage,
          email: emailInMessage,
        })
        const targetBooking = Array.isArray(targetBookingRaw) ? targetBookingRaw[0] : targetBookingRaw
        if (targetBooking) {
          const currentDate = new Date(targetBooking.date)
          const label = formatDateLabel(currentDate, targetBooking.time, locale)
          return respond({
            reply: t(
              `He encontrado tu cita ${String(targetBooking._id)} para ${label}. ¿Es esta la cita que quieres cancelar?`,
              `I found your booking ${String(targetBooking._id)} for ${label}. Is this the booking you want to cancel?`,
            ),
            state: {
              intent: "cancel",
              step: "await_booking_confirm",
              targetBookingId: String(targetBooking._id),
              targetBookingToken: targetBooking.accessToken,
              proposedSlots: [],
              selectedSlot: null,
              email: null,
              phone: null,
              objectionAttempts: 0,
            },
          })
        }

        return respond({
          reply: t(
            `No encuentro una cita activa con esos datos. Si quieres, prueba con otro correo o con el ID de la cita y lo revisamos. Y si no aparece, te ayudo a reservar una nueva en ${webBookingUrl}.`,
            `I can't find an active booking with those details. If you want, try another email or the booking ID, and if not I can help you book a new one at ${webBookingUrl}.`,
          ),
          state: {
            intent: "cancel",
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
      const currentDate = new Date(activeBooking.date)
      const label = formatDateLabel(currentDate, String(activeBooking.time), locale)
      return respond({
        reply: t(
          `Veo una cita activa para ${label}. ¿Es esta la cita que quieres cancelar?`,
          `I can see an active booking for ${label}. Is this the booking you want to cancel?`,
        ),
        state: {
          intent: "cancel",
          step: "await_booking_confirm",
          targetBookingId: String(activeBooking._id),
          targetBookingToken: String(activeBooking.accessToken),
          proposedSlots: [],
          selectedSlot: null,
          email: null,
          phone: null,
          objectionAttempts: 0,
        },
      })
    }

    if (wantsReschedule) {
      const bookingIdInMessage = extractBookingId(message)
      const bookingTokenInMessage = extractBookingToken(message)
      const emailInMessage = extractEmail(message)
      const mentionsId = /\bid\b/i.test(lower)
      const saysNoId = /\b(no tengo (el )?id|no se (mi |el )?id|no sé (mi |el )?id|no tengo el identificador|no lo tengo|no encuentro el id|no encuentro mi id|no encuentro el identificador)\b/i.test(lower)
      const saysNoEmail = /\b(no recuerdo el correo|no encuentro el correo|no encuentro el mail|no recuerdo el mail|no se que correo use|no sé qué correo usé|no me acuerdo del correo)\b/i.test(lower)
      if (activeBooking) {
        const currentDate = new Date(activeBooking.date)
        const label = formatDateLabel(currentDate, String(activeBooking.time), locale)
        return respond({
          reply: t(
            `Claro. Veo una cita activa para ${label}. ¿Es esta la que quieres reagendar?`,
            `Sure. I can see an active booking for ${label}. Is this the one you want to reschedule?`,
          ),
          state: {
            intent: "reschedule",
            step: "await_booking_confirm",
            targetBookingId: String(activeBooking._id),
            targetBookingToken: String(activeBooking.accessToken),
            proposedSlots: [],
            selectedSlot: null,
            email: null,
            phone: null,
            objectionAttempts: 0,
          },
        })
      }

      if (!bookingIdInMessage && !bookingTokenInMessage && !emailInMessage) {
        if (saysNoEmail) {
          return respond({
            reply: t(
              "No pasa nada. Si no recuerdas el correo, pásame el ID de la cita. Y si tampoco lo tienes, dime otro correo que creas que pudiste usar y lo revisamos.",
              "No problem. If you don't remember the email, send me the booking ID. And if you don't have it either, tell me another email you may have used and we'll check it.",
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
        if (saysNoId) {
          return respond({
            reply: t(
              "No pasa nada. Si no tienes el ID, pásame el correo con el que reservaste y lo reviso contigo.",
              "No problem. If you don't have the booking ID, send me the email used for the booking and I'll check it with you.",
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
        if (mentionsId) {
          return respond({
            reply: t(
              "Ese ID no parece válido. Pásame el ID correcto de la cita o, si te va mejor, el correo con el que reservaste y lo reviso contigo.",
              "That booking ID doesn't look valid. Send me the correct booking ID or, if it's easier, the email used for the booking.",
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
        return respond({
            reply: t(
            "Claro, te ayudo con eso. Para reagendar necesito el ID de la cita o el correo con el que reservaste.",
            "Sure. To reschedule, I need the booking ID or the email used for the booking.",
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
      const targetBookingRaw = await findRescheduleTarget({
        bookingId: bookingIdInMessage,
        bookingToken: bookingTokenInMessage,
        email: emailInMessage,
      })
      const targetBooking = Array.isArray(targetBookingRaw) ? targetBookingRaw[0] : targetBookingRaw
      if (!targetBooking) {
        return respond({
          reply: t(
            `No encuentro una cita activa con esos datos. Si quieres, revisamos otro ID o correo, y si no aparece te ayudo a reservar una nueva en ${webBookingUrl}.`,
            `I can't find an active booking with those details. If you want, we can try another ID or email, and if not I can help you book a new one at ${webBookingUrl}.`,
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
      const currentDate = new Date(targetBooking.date)
      const label = formatDateLabel(currentDate, targetBooking.time, locale)
      return respond({
        reply: t(
          `He encontrado tu cita ${String(targetBooking._id)} para ${label}. ¿Es esta la que quieres reagendar?`,
          `I found your booking ${String(targetBooking._id)} for ${label}. Is this the one you want to reschedule?`,
        ),
        state: {
          intent: "reschedule",
          step: "await_booking_confirm",
          proposedSlots: [],
          selectedSlot: null,
          email: null,
          phone: null,
          targetBookingId: String(targetBooking._id),
          targetBookingToken: targetBooking.accessToken,
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
