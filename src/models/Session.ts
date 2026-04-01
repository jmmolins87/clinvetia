import { Schema, model, models } from "mongoose"

const ChatStateSchema = new Schema(
  {
    intent: { type: String, enum: ["book", "reschedule", "cancel", "none"], default: "none" },
    step: {
      type: String,
      enum: ["idle", "await_timezone", "await_booking_id", "await_booking_confirm", "await_slot", "await_email", "await_email_confirm", "await_phone", "await_phone_confirm", "await_more_help"],
      default: "idle",
    },
    proposedSlots: [
      {
        date: { type: String },
        time: { type: String },
        label: { type: String },
      },
    ],
    selectedSlot: {
      date: { type: String },
      time: { type: String },
      label: { type: String },
    },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    targetBookingId: { type: String, default: null },
    targetBookingToken: { type: String, default: null },
    city: { type: String, default: null },
    objectionAttempts: { type: Number, default: 0 },
    qualificationStage: { type: Number, default: 0 },
    leadContext: { type: String, default: null },
  },
  { _id: false }
)

const SessionSchema = new Schema(
  {
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    roi: {
      monthlyPatients: { type: Number, default: null },
      averageTicket: { type: Number, default: null },
      conversionLoss: { type: Number, default: null },
      roi: { type: Number, default: null },
    },
    chatSummary: { type: String, default: "" },
    chatState: { type: ChatStateSchema, default: () => ({ intent: "none", step: "idle", objectionAttempts: 0, qualificationStage: 0 }) },
    chatHistory: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true, maxlength: 400 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

export const Session = models.Session || model("Session", SessionSchema)
