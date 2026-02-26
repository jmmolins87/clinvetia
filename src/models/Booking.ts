import { Schema, model, models } from "mongoose"

const BookingSchema = new Schema(
  {
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "expired", "cancelled"], default: "confirmed" },
    sessionToken: { type: String, default: null },
    accessToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    formExpiresAt: { type: Date, required: true },
    demoExpiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

export const Booking = models.Booking || model("Booking", BookingSchema)
