import { Schema, model, models } from "mongoose"

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
  },
  { timestamps: true }
)

export const Session = models.Session || model("Session", SessionSchema)
