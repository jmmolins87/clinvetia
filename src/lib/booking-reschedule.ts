import { Booking } from "@/models/Booking"
import { Contact } from "@/models/Contact"
import { buildGoogleMeetLink } from "@/lib/booking-communication"

type RescheduleSourceContact = {
  nombre: string
  email: string
  telefono: string
  clinica: string
  mensaje: string
  sessionToken?: string | null
  roi?: {
    monthlyPatients?: number | null
    averageTicket?: number | null
    conversionLoss?: number | null
    roi?: number | null
  } | null
}

type RescheduleResult =
  | { ok: false; reason: "booking_not_found" | "slot_unavailable" }
  | {
      ok: true
      previousBookingId: string
      previousAccessToken: string
      booking: {
        id: string
        accessToken: string
        date: Date
        time: string
        duration: number
        expiresAt: Date
        formExpiresAt: Date
        demoExpiresAt: Date
        googleMeetLink: string
        operatorEmail?: string | null
        rescheduledFromBookingId: string
      }
      contact: RescheduleSourceContact | null
    }

async function findSourceContact(originalBookingId: string, sessionToken?: string | null) {
  const contactByBooking = await Contact.findOne({
    bookingId: { $in: [originalBookingId, String(originalBookingId)] },
  })
    .sort({ createdAt: -1 })
    .lean<RescheduleSourceContact | null>()

  const sourceByBooking = Array.isArray(contactByBooking) ? contactByBooking[0] : contactByBooking
  if (sourceByBooking) {
    return sourceByBooking
  }

  if (!sessionToken) {
    return null
  }

  const contactBySession = await Contact.findOne({ sessionToken })
    .sort({ createdAt: -1 })
    .lean<RescheduleSourceContact | null>()

  return Array.isArray(contactBySession) ? contactBySession[0] : contactBySession
}

export async function rescheduleExistingBooking(params: {
  bookingId: string
  date: Date
  time: string
  duration: number
}) : Promise<RescheduleResult> {
  const originalBooking = await Booking.findById(params.bookingId)
  if (!originalBooking) {
    return { ok: false, reason: "booking_not_found" }
  }

  const [hour, min] = params.time.split(":").map(Number)
  const demoDateTime = new Date(params.date)
  demoDateTime.setHours(hour, min, 0, 0)

  const demoExpiresAt = new Date(demoDateTime)
  demoExpiresAt.setMinutes(demoExpiresAt.getMinutes() + params.duration)

  const expiresAt = new Date(params.date)
  expiresAt.setHours(23, 59, 59, 999)

  const formExpiresAt = new Date()
  formExpiresAt.setMinutes(formExpiresAt.getMinutes() + 10)

  const startDay = new Date(params.date)
  startDay.setHours(0, 0, 0, 0)
  const endDay = new Date(params.date)
  endDay.setHours(23, 59, 59, 999)

  const slotConflict = await Booking.findOne({
    _id: { $ne: originalBooking._id },
    date: { $gte: startDay, $lte: endDay },
    time: params.time,
    status: "confirmed",
  }).lean()

  if (slotConflict) {
    return { ok: false, reason: "slot_unavailable" }
  }

  const nextBooking = new Booking({
    date: new Date(params.date),
    time: params.time,
    duration: params.duration,
    status: "confirmed",
    sessionToken: originalBooking.sessionToken ?? null,
    operatorEmail: originalBooking.operatorEmail ?? null,
    accessToken: crypto.randomUUID(),
    expiresAt,
    formExpiresAt,
    demoExpiresAt,
    conversationSummary: originalBooking.conversationSummary ?? "",
    conversationMessages: Array.isArray(originalBooking.conversationMessages)
      ? originalBooking.conversationMessages.map((message) => ({
          role: message.role,
          content: message.content,
          timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
        }))
      : [],
    rescheduledFromBookingId: originalBooking._id,
  })
  nextBooking.googleMeetLink = buildGoogleMeetLink(String(nextBooking._id))
  await nextBooking.save()

  await Booking.updateOne(
    { _id: originalBooking._id },
    {
      $set: {
        status: "rescheduled",
        rescheduledToBookingId: nextBooking._id,
      },
    },
  )

  const sourceContact = await findSourceContact(String(originalBooking._id), originalBooking.sessionToken ?? null)
  if (sourceContact?.email) {
    await Contact.create({
      nombre: sourceContact.nombre,
      email: sourceContact.email,
      telefono: sourceContact.telefono,
      clinica: sourceContact.clinica,
      mensaje: sourceContact.mensaje,
      bookingId: nextBooking._id,
      sessionToken: sourceContact.sessionToken ?? originalBooking.sessionToken ?? null,
      roi: sourceContact.roi ?? {},
    })
  }

  return {
    ok: true,
    previousBookingId: String(originalBooking._id),
    previousAccessToken: String(originalBooking.accessToken),
    booking: {
      id: String(nextBooking._id),
      accessToken: String(nextBooking.accessToken),
      date: nextBooking.date,
      time: nextBooking.time,
      duration: nextBooking.duration,
      expiresAt: nextBooking.expiresAt,
      formExpiresAt: nextBooking.formExpiresAt,
      demoExpiresAt: nextBooking.demoExpiresAt,
      googleMeetLink: nextBooking.googleMeetLink || buildGoogleMeetLink(String(nextBooking._id)),
      operatorEmail: nextBooking.operatorEmail ?? null,
      rescheduledFromBookingId: String(originalBooking._id),
    },
    contact: sourceContact,
  }
}
