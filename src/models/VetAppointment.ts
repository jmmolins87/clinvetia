import { Schema, model, models } from "mongoose"

const VetAppointmentSchema = new Schema(
  {
    ownerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    petName: { type: String, required: true },
    species: { type: String, required: true },
    reason: { type: String, required: true },
    priority: { type: String, enum: ["normal", "urgent"], required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true, default: 30 },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
    channel: { type: String, default: "n8n_agent" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
)

export const VetAppointment = models.VetAppointment || model("VetAppointment", VetAppointmentSchema)
