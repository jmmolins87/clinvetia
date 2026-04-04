import { afterEach, describe, expect, it } from "vitest"

import { readGoogleCalendarConfig } from "@/lib/google-calendar"

const ORIGINAL_ENV = {
  GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID,
  GOOGLE_CALENDAR_CLIENT_EMAIL: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL,
  GOOGLE_CALENDAR_PRIVATE_KEY: process.env.GOOGLE_CALENDAR_PRIVATE_KEY,
  GOOGLE_CALENDAR_IMPERSONATED_USER: process.env.GOOGLE_CALENDAR_IMPERSONATED_USER,
  GOOGLE_CALENDAR_TIMEZONE: process.env.GOOGLE_CALENDAR_TIMEZONE,
}

afterEach(() => {
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (typeof value === "string") {
      process.env[key] = value
    } else {
      delete process.env[key]
    }
  }
})

describe("readGoogleCalendarConfig", () => {
  it("returns null when required env vars are missing", () => {
    delete process.env.GOOGLE_CALENDAR_ID
    delete process.env.GOOGLE_CALENDAR_CLIENT_EMAIL
    delete process.env.GOOGLE_CALENDAR_PRIVATE_KEY

    expect(readGoogleCalendarConfig()).toBeNull()
  })

  it("normalizes the private key and optional settings", () => {
    process.env.GOOGLE_CALENDAR_ID = "clinvetia@example.com"
    process.env.GOOGLE_CALENDAR_CLIENT_EMAIL = "service-account@example.iam.gserviceaccount.com"
    process.env.GOOGLE_CALENDAR_PRIVATE_KEY = "line-1\\nline-2"
    process.env.GOOGLE_CALENDAR_IMPERSONATED_USER = "calendar-owner@example.com"
    process.env.GOOGLE_CALENDAR_TIMEZONE = "Europe/Madrid"

    expect(readGoogleCalendarConfig()).toEqual({
      calendarId: "clinvetia@example.com",
      clientEmail: "service-account@example.iam.gserviceaccount.com",
      privateKey: "line-1\nline-2",
      impersonatedUser: "calendar-owner@example.com",
      timeZone: "Europe/Madrid",
    })
  })
})
