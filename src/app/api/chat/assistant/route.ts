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

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30",
]

type ChatSlot = {
  date: string
  time: string
  label: string
}

type ChatState = {
  intent?: "book" | "reschedule" | "cancel" | "none"
  step?: "idle" | "await_timezone" | "await_booking_id" | "await_slot" | "await_email" | "await_email_confirm" | "await_phone" | "await_phone_confirm" | "await_more_help"
  proposedSlots?: ChatSlot[]
  selectedSlot?: ChatSlot | null
  email?: string | null
  phone?: string | null
  targetBookingId?: string | null
  targetBookingToken?: string | null
  city?: string | null
  objectionAttempts?: number
  qualificationStage?: number
  leadContext?: string | null
}

const schema = z.object({
  message: z.string().trim().min(1).max(1200),
  state: z
    .object({
      intent: z.enum(["book", "reschedule", "cancel", "none"]).optional(),
      step: z.enum(["idle", "await_timezone", "await_booking_id", "await_slot", "await_email", "await_email_confirm", "await_phone", "await_phone_confirm", "await_more_help"]).optional(),
      proposedSlots: z
        .array(
          z.object({
            date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
            label: z.string().min(1).max(120),
          }),
        )
        .optional(),
      selectedSlot: z
        .object({
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
          label: z.string().min(1).max(120),
        })
        .nullable()
        .optional(),
      email: z.string().email().nullable().optional(),
      phone: z.string().nullable().optional(),
      targetBookingId: z.string().nullable().optional(),
      targetBookingToken: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      objectionAttempts: z.number().int().min(0).max(4).optional(),
      qualificationStage: z.number().int().min(0).max(6).optional(),
      leadContext: z.string().nullable().optional(),
    })
    .optional(),
  sessionToken: z.string().optional().nullable(),
  bookingToken: z.string().optional().nullable(),
})

function isAffirmative(text: string) {
  return /\b(si|sí|correcto|ok|vale|perfecto|confirmo|claro|exacto)\b/i.test(text)
}

function isNegative(text: string) {
  return /\b(no|incorrecto|mal|cambiar|otro|equivocado)\b/i.test(text)
}

function extractEmail(text: string) {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match?.[0]?.toLowerCase() || null
}

function extractPhone(text: string) {
  const cleaned = text.replace(/[^\d+]/g, "")
  const digits = cleaned.replace(/[^\d]/g, "")
  if (digits.length < 9) return null
  return cleaned
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
  const compact = text.replace(/\s+/g, " ").trim()
  if (compact.length < 2) return null
  return compact.slice(0, 80)
}

function isObjection(text: string) {
  return /\b(no me interesa|no ahora|despues|después|déjame pensarlo|dejame pensarlo|estoy ocupado|ocupada|no tengo tiempo|enviame info|envíame info|prefiero no|ahora no)\b/i.test(
    text,
  )
}

function objectionReply(attempt: number) {
  if (attempt <= 1) {
    return "Te entiendo 😊 Una rápida: qué te frustra más hoy de la captación o del seguimiento en tu clínica?"
  }
  if (attempt === 2) {
    return "Lo respeto. Muchos nos dijeron eso al inicio. Cómo gestionáis ahora los leads y el seguimiento?"
  }
  if (attempt === 3) {
    return "Totalmente. Si hoy pudieras mejorar solo una cosa de la atención al cliente, cuál sería?"
  }
  return "Sin compromiso, solo por curiosidad: cuál es tu meta de crecimiento para los próximos 3-6 meses en tu clínica? 📊"
}

function extractSlotChoice(text: string, length: number) {
  const oneBased = text.match(/\b([1-9])\b/)
  if (oneBased) {
    const index = Number(oneBased[1]) - 1
    if (index >= 0 && index < length) return index
  }
  return null
}

function isServiceQuestion(text: string) {
  return /\b(que es|qué es|explica|explicame|explícame|como funciona|cómo funciona|agente|agentes|ia|inteligencia artificial|veterinaria|veterinarias|servicio|solucion|solución)\b/i.test(
    text,
  )
}

function isGreeting(text: string) {
  return /\b(hola|buenas|hey|hello|buenos dias|buenas tardes|buenas noches)\b/i.test(text)
}

function shortContext(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim()
  return normalized.length > 90 ? `${normalized.slice(0, 90)}...` : normalized
}

const CHAT_SYSTEM_PROMPT = [
  "Eres el setter comercial de WhatsApp de ClinvetIA.",
  "Objetivo comercial: mover la conversacion hacia cita consultiva con datos completos.",
  "Regla critica de objeciones: ante rechazo, reintenta 4 veces con estrategias diferentes (curiosidad, identificacion, comparacion social, vision futura).",
  "No menciones IA, herramientas, APIs ni procesos internos.",
  "Escribe mensajes cortos y naturales, tono humano, una pregunta por mensaje.",
  "Valida emocion antes de redirigir y referencia lo que dijo el lead.",
  "Si hay objecion, responde con enfoque consultivo y orientado a cita.",
  "Evita frases roboticas: 'Excelente pregunta', 'No entendi tu mensaje', 'Te explico'.",
  "No inventes precios ni promesas no confirmadas.",
].join(" ")

async function generateConversationalReply(userMessage: string) {
  const geminiApiKey = process.env.GEMINI_API_KEY
  const geminiPreferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  const geminiModels = Array.from(new Set([geminiPreferredModel, "gemini-2.0-flash", "gemini-2.0-flash-lite"]))

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
                parts: [{ text: userMessage }],
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
            { role: "user", content: userMessage },
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

function formatDateLabel(date: Date, time: string) {
  const label = date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  return `${label} a las ${time}`
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

async function buildSlots(limit = 3) {
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
    for (const time of TIME_SLOTS) {
      if (unavailable.has(time)) continue
      const key = new Date(date)
      results.push({
        date: key.toISOString().slice(0, 10),
        time,
        label: formatDateLabel(key, time),
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
    await dbConnect()

    const message = parsed.message.trim()
    const lower = message.toLowerCase()
    const wantsBooking = /\b(reservar|reserva|demo|cita|agendar)\b/i.test(lower)
    const wantsReschedule = /\b(reagendar|reprogramar|cambiar hora|cambiar cita)\b/i.test(lower)
    const wantsCancel = /\b(cancelar|cancela|anular|anula)\b/i.test(lower)
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
          .select("token expiresAt roi")
          .lean<{
            token: string
            expiresAt: Date
            roi?: {
              monthlyPatients?: number | null
              averageTicket?: number | null
              conversionLoss?: number | null
              roi?: number | null
            } | null
          } | null>()
      : null
    const hasValidRoiSession = hasCompleteRoi(activeSession)
    const isBookingFlowStep = ["await_timezone", "await_booking_id", "await_slot", "await_email", "await_email_confirm", "await_phone", "await_phone_confirm"].includes(
      current.step || "",
    )
    const hasBookingIntent = current.intent === "book" || current.intent === "reschedule"

    if (current.step === "idle" && wantsBooking && !hasValidRoiSession) {
      return NextResponse.json({
        reply:
          "Antes de reservar, hagamos primero tu cálculo ROI para entender mejor tu clínica. Te abro la calculadora.",
        openRoiCalculator: true,
        state: { intent: "none", step: "idle" },
      })
    }

    if (current.intent === "book" && current.step !== "idle" && !hasValidRoiSession) {
      return NextResponse.json({
        reply:
          "Para seguir con la reserva, primero necesito tu ROI. Te abro la calculadora.",
        openRoiCalculator: true,
        state: { intent: "none", step: "idle" },
      })
    }

    if (current.intent === "book" && current.step !== "idle") {
      return NextResponse.json({
        reply:
          "Para reservar una cita nueva necesitamos tus datos de contacto completos. Haz la reserva desde la web y yo me encargo de reagendar o cancelar cuando lo necesites.",
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
      })
    }

    if (isBookingFlowStep && !hasValidRoiSession) {
      return NextResponse.json({
        reply:
          "Nos falta el ROI para continuar con la reserva. Te abro la calculadora ahora.",
        openRoiCalculator: true,
        state: { intent: "none", step: "idle" },
      })
    }

    if (isBookingFlowStep && !hasBookingIntent) {
      return NextResponse.json({
        reply: "He perdido el contexto de la reserva. Si quieres, empezamos de nuevo y te propongo horarios.",
        state: { intent: "none", step: "idle" },
      })
    }

    if (current.step === "idle" && /\b(clinvetia|clinvetia\.com|que es clinvetia|quien sois|quienes sois)\b/i.test(lower)) {
      return NextResponse.json({
        reply:
          "ClinvetIA desarrolla agentes para clinicas veterinarias que organizan citas y mejoran la atencion al cliente. Si te va bien, te propongo ahora mismo tres horarios y te reservo cita en un minuto.",
        state: { intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 1 },
      })
    }

    if (current.step === "idle" && isGreeting(lower) && !wantsBooking && !wantsReschedule && !wantsCancel) {
      return NextResponse.json({
        reply: "Hola 😊 Soy el agente de ClinvetIA. Me cuentas un poco de tu clínica y cómo captáis nuevos clientes?",
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
        return NextResponse.json({
          reply: `Ah, interesante lo que me cuentas de "${shortContext(message)}". Cómo estáis gestionando ahora la captación y seguimiento?`,
          state: { ...current, step: "idle", qualificationStage: 2, leadContext: shortContext(message), objectionAttempts: 0 },
        })
      }
      if ((current.qualificationStage || 0) === 2) {
        return NextResponse.json({
          reply: "Ya veo. Os está dando los resultados que esperabais o se os escapan oportunidades?",
          state: { ...current, step: "idle", qualificationStage: 3, objectionAttempts: 0 },
        })
      }
      if ((current.qualificationStage || 0) === 3) {
        return NextResponse.json({
          reply: "Entiendo. Qué meta de crecimiento tenéis para los próximos 3-6 meses?",
          state: { ...current, step: "idle", qualificationStage: 4, objectionAttempts: 0 },
        })
      }
      if ((current.qualificationStage || 0) === 4) {
        return NextResponse.json({
          reply: "Tiene sentido. Si quieres, te paso el enlace para reservar consultoría y verlo con tu caso. Te lo comparto?",
          state: { ...current, step: "idle", qualificationStage: 5, objectionAttempts: 0 },
        })
      }
      if ((current.qualificationStage || 0) >= 5 && isAffirmative(lower)) {
        return NextResponse.json({
          reply: `Genial 🚀 Reserva aquí: ${webBookingUrl}. En cuanto tengas ID de cita, yo te ayudo a reagendar o cancelar cuando lo necesites.`,
          state: { ...current, step: "idle", qualificationStage: 6, objectionAttempts: 0 },
        })
      }
    }

    if (current.step === "idle" && isObjection(lower) && !activeBooking) {
      const attempt = Math.min(4, (current.objectionAttempts || 0) + 1)
      if (attempt < 4) {
        return NextResponse.json({
          reply: objectionReply(attempt),
          state: {
            ...current,
            step: "idle",
            objectionAttempts: attempt,
          },
        })
      }
      return NextResponse.json({
        reply: `${objectionReply(attempt)} Si te encaja, lo vemos en una consultoría breve y sin coste.`,
        state: {
          ...current,
          step: "idle",
          objectionAttempts: attempt,
          qualificationStage: Math.max(current.qualificationStage || 1, 1),
        },
      })
    }

    if (current.step === "idle" && isServiceQuestion(lower)) {
      const aiReply = await generateConversationalReply(message)
      return NextResponse.json({
        reply:
          aiReply?.text ||
          "Buena pregunta. Nuestros agentes atienden mensajes de clientes, priorizan casos y organizan citas para que tu equipo tenga menos carga operativa. Si quieres, te lo explico con un ejemplo real de clinica.",
        provider: aiReply?.provider || "fallback",
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
      })
    }

    if (current.step === "await_timezone") {
      const city = extractCity(message)
      if (!city) {
        return NextResponse.json({
          reply: "Para ajustar horario, dime ciudad y país donde estás.",
          state: current,
        })
      }
      const slots = await buildSlots(3)
      if (!slots.length) {
        return NextResponse.json({
          reply: "Ahora mismo no tengo huecos disponibles. Prueba en unos minutos.",
          state: { intent: "none", step: "idle", objectionAttempts: 0 },
        })
      }
      return NextResponse.json({
        reply: `Vale, te dejo tres opciones para ${city}:\n1) ${slots[0].label}\n2) ${slots[1]?.label || "-"}\n3) ${slots[2]?.label || "-"}\nCuál te encaja mejor?`,
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
        return NextResponse.json({
          reply: "No detecto un identificador de cita válido. Envíame el ID de cita o el token que recibiste por correo.",
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
        return NextResponse.json({
          reply: "No encuentro una cita activa con ese identificador. Revísalo y lo intentamos de nuevo.",
          state: current,
        })
      }
      const slots = await buildSlots(3)
      if (!slots.length) {
        return NextResponse.json({
          reply: "Ahora mismo no tengo huecos disponibles. Prueba en unos minutos.",
          state: { intent: "none", step: "idle" },
        })
      }
      return NextResponse.json({
        reply: `Ya tengo tu cita ${String(bookingById._id)}. Te propongo 3 horarios:\n1) ${slots[0].label}\n2) ${slots[1]?.label || "-"}\n3) ${slots[2]?.label || "-"}\nElige 1, 2 o 3.`,
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
      const slotIndex = extractSlotChoice(lower, current.proposedSlots?.length || 0)
      if (slotIndex === null) {
        return NextResponse.json({
          reply: "Elige una opcion escribiendo 1, 2 o 3 para seguir.",
          state: current,
        })
      }
      const selectedSlot = current.proposedSlots?.[slotIndex] || null
      if (!selectedSlot) {
        return NextResponse.json({
          reply: "Ese horario ya no esta disponible. Te paso opciones nuevas.",
          state: { ...current, proposedSlots: await buildSlots(3) },
        })
      }
      return NextResponse.json({
        reply: `Genial, te dejo ${selectedSlot.label}. Pásame tu email para enviarte confirmación.`,
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
        return NextResponse.json({
          reply: "No veo un email valido. Escribelo completo, por ejemplo nombre@clinica.com.",
          state: current,
        })
      }
      return NextResponse.json({
        reply: `Me confirmas si este email está bien: ${email}`,
        state: {
          ...current,
          email,
          step: "await_email_confirm",
        },
      })
    }

    if (current.step === "await_email_confirm") {
      if (isNegative(lower)) {
        return NextResponse.json({
          reply: "Dale, pásame el email correcto y seguimos.",
          state: {
            ...current,
            email: null,
            step: "await_email",
          },
        })
      }
      if (!isAffirmative(lower)) {
        return NextResponse.json({
          reply: "Responde si o no para confirmar el email.",
          state: current,
        })
      }
      return NextResponse.json({
        reply: "Ahora pásame tu teléfono de contacto.",
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
        return NextResponse.json({
          reply: "No detecto un telefono valido. Enviamelo con prefijo si aplica.",
          state: current,
        })
      }
      return NextResponse.json({
        reply: `Me confirmas este teléfono: ${phone}`,
        state: {
          ...current,
          phone,
          step: "await_phone_confirm",
        },
      })
    }

    if (current.step === "await_phone_confirm") {
      if (isNegative(lower)) {
        return NextResponse.json({
          reply: "Dale, pasame el telefono correcto.",
          state: {
            ...current,
            phone: null,
            step: "await_phone",
          },
        })
      }
      if (!isAffirmative(lower)) {
        return NextResponse.json({
          reply: "Responde si o no para confirmar el telefono.",
          state: current,
        })
      }

      if (!current.selectedSlot) {
        const slots = await buildSlots(3)
        return NextResponse.json({
          reply: "Se perdio el horario seleccionado. Te paso opciones nuevas.",
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
          return NextResponse.json({
            reply: `No encuentro una cita activa con ese ID. Si quieres crear una nueva, hazlo desde ${webBookingUrl} y luego te ayudo aquí con cambios.`,
            state: { intent: "none", step: "idle" },
          })
        }
        const ok = await rescheduleBooking(String(targetBooking._id), current.selectedSlot)
        if (!ok) {
          const slots = await buildSlots(3)
          return NextResponse.json({
            reply: "Ese horario ya no esta libre. Te dejo tres nuevas opciones.",
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
        return NextResponse.json({
          reply: emailDelivered
            ? `Listo, tu cita ${String(targetBooking._id)} quedó reagendada para ${current.selectedSlot.label}. Te he enviado el correo actualizado. ¿Necesitas algo más?`
            : `Listo, tu cita ${String(targetBooking._id)} quedó reagendada para ${current.selectedSlot.label}. ¿Necesitas algo más?`,
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

      return NextResponse.json({
        reply:
          "Gracias. Para crear citas nuevas necesitamos cerrar tus datos en el formulario web. Yo me quedo disponible para reagendar o cancelar cualquier cita existente.",
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
      })
    }

    if (current.step === "await_more_help") {
      if (isNegative(lower)) {
        return NextResponse.json({
          reply: "Gracias por tu tiempo. Cuando quieras, aquí me tienes. Que tengas un gran día.",
          state: { intent: "none", step: "idle", objectionAttempts: 0 },
        })
      }
      return NextResponse.json({
        reply: "Cuéntame qué necesitas y te ayudo.",
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
      })
    }

    if (/\b(cancelar|cancela|anular|anula)\b/i.test(lower)) {
      if (!activeBooking) {
        return NextResponse.json({
          reply: `No veo una cita activa para cancelar. Si quieres crear una nueva, hazlo desde ${webBookingUrl} y luego te ayudo con cambios.`,
          state: { intent: "none", step: "idle" },
        })
      }
      await clearRoiForBookingContext({
        bookingId: String(activeBooking._id),
        bookingSessionToken: activeBooking.sessionToken ?? null,
        contactSessionToken: activeBooking.sessionToken ?? null,
      })
      await Booking.updateOne({ _id: activeBooking._id }, { $set: { status: "cancelled" } })
      return NextResponse.json({
        reply: "He cancelado tu cita activa. Si quieres, te propongo nuevos horarios ahora.",
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
        booking: null,
      })
    }

    if (/\b(reagendar|reprogramar|cambiar hora|cambiar cita)\b/i.test(lower)) {
      const bookingIdInMessage = extractBookingId(message)
      const bookingTokenInMessage = extractBookingToken(message)
      if (!bookingIdInMessage && !bookingTokenInMessage) {
        return NextResponse.json({
          reply: "Claro. Para reagendar necesito el ID de cita o el token de reserva que te llegó por correo.",
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
        return NextResponse.json({
          reply: "No encuentro una cita activa con ese identificador. Revísalo y te ayudo a intentarlo de nuevo.",
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
      const slots = await buildSlots(3)
      if (!slots.length) {
        return NextResponse.json({
          reply: "Ahora mismo no tengo huecos disponibles. Prueba en unos minutos.",
          state: { intent: "none", step: "idle" },
        })
      }
      return NextResponse.json({
        reply: `Ya tengo tu cita ${String(targetBooking._id)}. Te propongo estas opciones:\n1) ${slots[0].label}\n2) ${slots[1]?.label || "-"}\n3) ${slots[2]?.label || "-"}\nEscribe 1, 2 o 3.`,
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
        const label = formatDateLabel(currentDate, String(activeBooking.time))
        return NextResponse.json({
          reply: `Ya tienes una cita activa para ${label}. ID de cita: ${String(activeBooking._id)}. Si quieres la puedo reagendar o cancelar.`,
          state: { intent: "none", step: "idle", objectionAttempts: 0 },
        })
      }
      return NextResponse.json({
        reply:
          "Para reservar una cita nueva, hazlo desde el flujo web de ClinvetIA para completar tus datos. Cuando quieras, yo te ayudo a reagendar o cancelar con tu ID de cita.",
        state: { intent: "none", step: "idle", objectionAttempts: 0 },
      })
    }

    const fallbackAiReply = await generateConversationalReply(message)
    return NextResponse.json({
      reply:
        fallbackAiReply?.text ||
        "Te ayudo con lo que necesites: puedo explicarte cómo funcionan nuestros agentes o ayudarte con tu cita. Qué prefieres?",
      provider: fallbackAiReply?.provider || "fallback",
      state: { intent: "none", step: "idle", objectionAttempts: 0 },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
