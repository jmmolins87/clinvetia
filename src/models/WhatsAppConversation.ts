import { Schema, model, models } from "mongoose"

const WhatsAppConversationSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: null },
    state: { type: Object, default: { intent: "none", step: "idle" } },
    sessionToken: { type: String, default: null },
    bookingToken: { type: String, default: null },
    roiStep: { type: String, default: null },
    roiDraft: {
      monthlyPatients: { type: Number, default: null },
      averageTicket: { type: Number, default: null },
      conversionLoss: { type: Number, default: null },
    },
    lastInboundAt: { type: Date, default: null },
    lastOutboundAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export const WhatsAppConversation =
  models.WhatsAppConversation || model("WhatsAppConversation", WhatsAppConversationSchema)
