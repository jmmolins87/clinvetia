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

export function buildICS(params: {
  uid: string
  start: Date
  end: Date
  summary: string
  description: string
  location: string
  organizerEmail: string
  attendeeEmail: string
}) {
  const dtStamp = toICSDate(new Date())
  const dtStart = toICSDate(params.start)
  const dtEnd = toICSDate(params.end)

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Clinvetia//Booking//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${params.uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${params.summary}`,
    `DESCRIPTION:${params.description}`,
    `LOCATION:${params.location}`,
    `ORGANIZER:MAILTO:${params.organizerEmail}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:${params.attendeeEmail}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}
