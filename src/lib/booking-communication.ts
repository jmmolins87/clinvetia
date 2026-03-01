import { Types } from "mongoose"
import { Booking } from "@/models/Booking"

export const CUSTOMER_DELIVERY_EMAIL = "info@clinvetia.com"

export function buildGoogleMeetLink(bookingId: string) {
  return `https://meet.google.com/new#booking-${bookingId}`
}

type BookingEmailEventInput = {
  bookingId: string
  category: string
  subject: string
  intendedRecipient?: string | null
  deliveredTo: string
  status: "sent" | "failed"
  error?: string | null
  message?: string | null
  googleMeetLink?: string | null
}

export async function appendBookingEmailEvent(input: BookingEmailEventInput) {
  if (!Types.ObjectId.isValid(input.bookingId)) return

  await Booking.updateOne(
    { _id: input.bookingId },
    {
      ...(input.googleMeetLink ? { $set: { googleMeetLink: input.googleMeetLink } } : {}),
      $push: {
        emailEvents: {
          category: input.category,
          subject: input.subject,
          intendedRecipient: input.intendedRecipient ?? null,
          deliveredTo: input.deliveredTo,
          status: input.status,
          error: input.error ?? null,
          message: input.message ?? null,
          sentAt: new Date(),
        },
      },
    }
  )
}
