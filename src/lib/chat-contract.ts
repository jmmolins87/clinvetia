import { z } from "zod"

export const chatSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  label: z.string().min(1).max(120),
})

export const chatStateSchema = z.object({
  intent: z.enum(["book", "reschedule", "cancel", "none"]).optional(),
  step: z.enum(["idle", "await_timezone", "await_booking_id", "await_slot", "await_email", "await_email_confirm", "await_phone", "await_phone_confirm", "await_more_help"]).optional(),
  proposedSlots: z.array(chatSlotSchema).optional(),
  selectedSlot: chatSlotSchema.nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  targetBookingId: z.string().nullable().optional(),
  targetBookingToken: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  objectionAttempts: z.number().int().min(0).max(4).optional(),
  qualificationStage: z.number().int().min(0).max(6).optional(),
  leadContext: z.string().nullable().optional(),
})

export const chatHistoryMessageSchema = z.object({
  role: z.enum(["assistant", "user"]),
  content: z.string().trim().min(1).max(400),
  timestamp: z.string().datetime().optional(),
})

export const chatAssistantRequestSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  history: z.array(chatHistoryMessageSchema).max(12).optional(),
  state: chatStateSchema.optional(),
  sessionToken: z.string().optional().nullable(),
  bookingToken: z.string().optional().nullable(),
  locale: z.enum(["es", "en"]).optional(),
  pathname: z.string().trim().max(240).optional().nullable(),
  pageUrl: z.string().url().max(2048).optional().nullable(),
})

export const chatBookingSchema = z.object({
  bookingId: z.string(),
  accessToken: z.string(),
  date: z.string(),
  time: z.string(),
  duration: z.number().int().positive(),
})

export const chatAssistantResponseSchema = z.object({
  reply: z.string().trim().min(1).max(4000),
  openCalendar: z.boolean().optional(),
  openRoiCalculator: z.boolean().optional(),
  state: chatStateSchema.optional(),
  booking: chatBookingSchema.nullable().optional(),
})

export const n8nChatWebhookPayloadSchema = z.object({
  event: z.literal("chat.message"),
  channel: z.literal("web"),
  source: z.literal("website-chatbot"),
  requestId: z.string().min(1),
  sentAt: z.string().datetime(),
  message: chatAssistantRequestSchema.shape.message,
  locale: z.enum(["es", "en"]),
  history: chatAssistantRequestSchema.shape.history.default([]),
  state: chatStateSchema.optional(),
  sessionToken: z.string().nullable().optional(),
  bookingToken: z.string().nullable().optional(),
  pathname: z.string().nullable().optional(),
  pageUrl: z.string().nullable().optional(),
})

export type ChatSlot = z.infer<typeof chatSlotSchema>
export type ChatState = z.infer<typeof chatStateSchema>
export type ChatHistoryMessage = z.infer<typeof chatHistoryMessageSchema>
export type ChatAssistantRequest = z.infer<typeof chatAssistantRequestSchema>
export type ChatBooking = z.infer<typeof chatBookingSchema>
export type ChatAssistantResponse = z.infer<typeof chatAssistantResponseSchema>
export type N8nChatWebhookPayload = z.infer<typeof n8nChatWebhookPayloadSchema>
export type ChatLocale = NonNullable<ChatAssistantRequest["locale"]>
