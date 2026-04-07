function pad(n: number) {
  return String(n).padStart(2, "0")
}

function toICSDate(date: Date) {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  )
}

function toICSLocalDate(date: Date) {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds())
  )
}

export function buildICS(params: {
  uid: string
  start: Date
  end: Date
  summary: string
  description: string
  location: string
  url?: string
  timeZone?: string
  organizerEmail: string
  attendeeEmail: string
}) {
  const dtStamp = toICSDate(new Date())
  const dtStart = params.timeZone ? toICSLocalDate(params.start) : toICSDate(params.start)
  const dtEnd = params.timeZone ? toICSLocalDate(params.end) : toICSDate(params.end)

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Clinvetia//Booking//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${params.uid}`,
    `DTSTAMP:${dtStamp}`,
    params.timeZone ? `DTSTART;TZID=${params.timeZone}:${dtStart}` : `DTSTART:${dtStart}`,
    params.timeZone ? `DTEND;TZID=${params.timeZone}:${dtEnd}` : `DTEND:${dtEnd}`,
    `SUMMARY:${params.summary}`,
    `DESCRIPTION:${params.description}`,
    `LOCATION:${params.location}`,
    ...(params.url ? [`URL:${params.url}`] : []),
    `ORGANIZER:MAILTO:${params.organizerEmail}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:${params.attendeeEmail}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}
