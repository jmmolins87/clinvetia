import { beforeEach, describe, expect, it, vi } from "vitest"

const mockDbConnect = vi.fn()
const mockBookingFindById = vi.fn()
const mockContactFindOne = vi.fn()
const mockContactCreate = vi.fn()
const mockAdminMailboxCreate = vi.fn()
const mockRecordAdminAudit = vi.fn()
const mockSendBrevoEmail = vi.fn()
const mockEnsureBookingGoogleMeetLink = vi.fn()
const mockAppendBookingEmailEvent = vi.fn()
const mockCallN8nChatWebhook = vi.fn()
const mockVerifyRecaptchaToken = vi.fn()

vi.mock("@/lib/db", () => ({
  dbConnect: mockDbConnect,
}))

vi.mock("@/models/Booking", () => ({
  Booking: {
    findById: mockBookingFindById,
  },
}))

vi.mock("@/models/Contact", () => ({
  Contact: {
    findOne: mockContactFindOne,
    create: mockContactCreate,
  },
}))

vi.mock("@/models/Session", () => ({
  Session: {
    findOne: vi.fn(),
  },
}))

vi.mock("@/models/AdminMailboxMessage", () => ({
  AdminMailboxMessage: {
    create: mockAdminMailboxCreate,
  },
}))

vi.mock("@/lib/brevo", () => ({
  sendBrevoEmail: mockSendBrevoEmail,
}))

vi.mock("@/lib/booking-communication", () => ({
  appendBookingEmailEvent: mockAppendBookingEmailEvent,
  ensureBookingGoogleMeetLink: mockEnsureBookingGoogleMeetLink,
}))

vi.mock("@/lib/admin-mailbox", () => ({
  getSharedMailboxEmail: () => "shared@clinvetia.com",
}))

vi.mock("@/lib/admin-audit", () => ({
  recordAdminAudit: mockRecordAdminAudit,
}))

vi.mock("@/lib/n8n-integration", () => ({
  isN8nChatConfigured: () => false,
  callN8nChatWebhook: mockCallN8nChatWebhook,
}))

vi.mock("@/lib/recaptcha-server", () => ({
  verifyRecaptchaToken: mockVerifyRecaptchaToken,
}))

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.NODE_ENV = "test"
    process.env.BREVO_REPLY_TO = "info@clinvetia.com"
    mockDbConnect.mockResolvedValue(undefined)
    mockVerifyRecaptchaToken.mockResolvedValue({ ok: true, score: 1 })
    mockContactFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    })
    mockContactCreate.mockResolvedValue({ _id: { toString: () => "contact-1" } })
    mockAdminMailboxCreate.mockResolvedValue(undefined)
    mockRecordAdminAudit.mockResolvedValue(undefined)
    mockSendBrevoEmail.mockResolvedValue({ ok: true })
    mockEnsureBookingGoogleMeetLink.mockResolvedValue("https://meet.google.com/test-shared-link")
    mockAppendBookingEmailEvent.mockResolvedValue(undefined)
  })

  it("sends an ICS with the booked date and the persisted Meet link", async () => {
    const bookingDate = new Date("2026-04-15T00:00:00.000Z")
    mockBookingFindById.mockResolvedValue({
      _id: { toString: () => "booking-123" },
      accessToken: "secret-token",
      date: bookingDate,
      time: "10:30",
      duration: 45,
      demoExpiresAt: new Date("2026-04-15T11:15:00.000Z"),
      formExpiresAt: new Date("2026-04-15T09:00:00.000Z"),
    })

    const { POST } = await import("@/app/api/contact/route")

    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "Ana Clínica",
        email: "ana@clinic.com",
        telefono: "600123123",
        clinica: "Clínica Centro",
        mensaje: "Quiero confirmar la demo.",
        bookingId: "booking-123",
        accessToken: "secret-token",
        recaptchaToken: "recaptcha-dev-bypass-token",
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(mockEnsureBookingGoogleMeetLink).toHaveBeenCalledWith("booking-123")
    expect(mockSendBrevoEmail).toHaveBeenCalled()

    const firstEmailPayload = mockSendBrevoEmail.mock.calls[0][0]
    const icsBase64 = firstEmailPayload.attachments[0].content
    const ics = Buffer.from(icsBase64, "base64").toString("utf8")

    expect(ics).toContain("DTSTART;TZID=Europe/Madrid:20260415T103000")
    expect(ics).toContain("DTEND;TZID=Europe/Madrid:20260415T111500")
    expect(ics).toContain("URL:https://meet.google.com/test-shared-link")
    expect(ics).toContain("LOCATION:https://meet.google.com/test-shared-link")

    const customerEmailPayload = mockSendBrevoEmail.mock.calls.find((call) => call[0].to[0].email === "ana@clinic.com")?.[0]
    const internalEmailPayload = mockSendBrevoEmail.mock.calls.find((call) => call[0].to[0].email === "info@clinvetia.com")?.[0]

    expect(customerEmailPayload).toBeTruthy()
    expect(internalEmailPayload).toBeTruthy()
    expect(customerEmailPayload.attachments[0].content).toBe(internalEmailPayload.attachments[0].content)
  })
})
