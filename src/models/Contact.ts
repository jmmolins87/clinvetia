import { Schema, model, models } from "mongoose"

const ContactSchema = new Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, required: true },
    clinica: { type: String, required: true },
    mensaje: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
    sessionToken: { type: String, default: null },
    roi: {
      monthlyPatients: { type: Number, default: null },
      averageTicket: { type: Number, default: null },
      conversionLoss: { type: Number, default: null },
      roi: { type: Number, default: null },
    },
  },
  { timestamps: true }
)

export const Contact = models.Contact || model("Contact", ContactSchema)
