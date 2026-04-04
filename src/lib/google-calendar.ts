export type GoogleCalendarConfig = {
  calendarId: string
  clientEmail: string
  privateKey: string
  impersonatedUser?: string
  timeZone: string
}

export type GoogleCalendarSyncResult = {
  eventId: string
  htmlLink: string | null
  googleMeetLink: string | null
}

type GoogleCalendarBookingParams = {
  bookingId: string
  date: Date
  time: string
  duration: number
  eventId?: string | null
  summary?: string
  description?: string
}

export function readGoogleCalendarConfig(): GoogleCalendarConfig | null {
  return null
}

export async function syncBookingToGoogleCalendar(params: GoogleCalendarBookingParams): Promise<GoogleCalendarSyncResult | null> {
  void params
  return null
}

export async function deleteBookingFromGoogleCalendar(eventId?: string | null) {
  void eventId
  return true
}
