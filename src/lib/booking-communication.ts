import { Types } from "mongoose"
import { Booking } from "@/models/Booking"

export const CUSTOMER_DELIVERY_EMAIL = "info@clinvetia.com"

export function buildGoogleMeetLink(bookingId: string) {
  return `https://meet.google.com/new#booking-${bookingId}`
}

export function buildInternalBookingUrl(bookingId: string, accessToken?: string | null) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "").replace(/\/+$/, "")
  const params = new URLSearchParams({ booking_id: bookingId })
  if (accessToken) {
    params.set("booking_token", accessToken)
  }
  const pathname = `/contacto?${params.toString()}`
  return appUrl ? `${appUrl}${pathname}` : pathname
}

export async function ensureBookingGoogleMeetLink(bookingId: string) {
  if (!Types.ObjectId.isValid(bookingId)) {
    return buildGoogleMeetLink(bookingId)
  }

  const existing = await Booking.findById(bookingId).select("googleMeetLink").lean<{ googleMeetLink?: string | null }>()
  const currentLink = Array.isArray(existing) ? existing[0]?.googleMeetLink : existing?.googleMeetLink
  if (currentLink) {
    return currentLink
  }

  const nextLink = buildGoogleMeetLink(bookingId)
  await Booking.updateOne(
    { _id: bookingId, $or: [{ googleMeetLink: null }, { googleMeetLink: "" }, { googleMeetLink: { $exists: false } }] },
    { $set: { googleMeetLink: nextLink } }
  )
  return nextLink
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
