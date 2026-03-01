import { Schema, model, models } from "mongoose"

const ConversationMessageSchema = new Schema(
  {
    channel: { type: String, enum: ["web", "whatsapp"], required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    externalId: { type: String, default: null, index: true },
    sessionToken: { type: String, default: null, index: true },
    bookingToken: { type: String, default: null, index: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true, maxlength: 4000 },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true },
)

ConversationMessageSchema.index({ channel: 1, conversationId: 1, createdAt: 1 })
ConversationMessageSchema.index({ createdAt: -1 })

export const ConversationMessage =
  models.ConversationMessage || model("ConversationMessage", ConversationMessageSchema)
