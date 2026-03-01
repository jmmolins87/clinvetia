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
    googleMeetLink: { type: String, default: null },
    emailEvents: {
      type: [
        new Schema(
          {
            category: { type: String, required: true },
            subject: { type: String, required: true },
            intendedRecipient: { type: String, default: null },
            deliveredTo: { type: String, required: true },
            status: { type: String, enum: ["sent", "failed"], required: true },
            error: { type: String, default: null },
            message: { type: String, default: null },
            sentAt: { type: Date, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
)

export const Booking = models.Booking || model("Booking", BookingSchema)
