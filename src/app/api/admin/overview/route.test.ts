import { beforeEach, describe, expect, it, vi } from "vitest"

const mockRequireAdmin = vi.fn()
const mockDbConnect = vi.fn()
const mockExpireOverdueBookings = vi.fn()
const mockBookingFind = vi.fn()
const mockBookingAggregate = vi.fn()
const mockContactCountDocuments = vi.fn()
const mockContactFind = vi.fn()
const mockContactAggregate = vi.fn()

vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: mockRequireAdmin,
}))

vi.mock("@/lib/db", () => ({
  dbConnect: mockDbConnect,
}))

vi.mock("@/lib/booking-expiration", () => ({
  expireOverdueBookings: mockExpireOverdueBookings,
}))

vi.mock("@/models/Booking", () => ({
  Booking: {
    find: mockBookingFind,
    aggregate: mockBookingAggregate,
  },
}))

vi.mock("@/models/Contact", () => ({
  Contact: {
    countDocuments: mockContactCountDocuments,
    find: mockContactFind,
    aggregate: mockContactAggregate,
  },
}))

vi.mock("@/lib/admin-demo-bookings-state", () => ({
  listDemoBookings: vi.fn(),
  listDemoContactsWithBookings: vi.fn(),
}))

describe("GET /api/admin/overview", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.NEXT_PUBLIC_APP_URL
    delete process.env.APP_URL
    mockRequireAdmin.mockResolvedValue({
      ok: true,
      data: { admin: { role: "superadmin" } },
    })
    mockDbConnect.mockResolvedValue(undefined)
    mockExpireOverdueBookings.mockResolvedValue(undefined)
    mockContactCountDocuments.mockResolvedValue(1)
    mockBookingAggregate.mockResolvedValue([])
    mockContactAggregate.mockResolvedValue([])
  })

  it("returns an internal reservation URL based on booking_id and booking_token", async () => {
    const booking = {
      _id: "67f54b6a9f2f4c0012345678",
      accessToken: "booking-secret-token",
      date: new Date("2026-04-15T00:00:00.000Z"),
      time: "10:30",
      duration: 45,
      status: "confirmed",
      sessionToken: null,
      rescheduledFromBookingId: null,
      rescheduledToBookingId: null,
      googleMeetLink: "https://meet.google.com/test-shared-link",
      conversationSummary: "",
      conversationMessages: [],
      emailEvents: [],
      createdAt: new Date("2026-04-08T09:00:00.000Z"),
    }

    mockBookingFind.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([booking]),
      }),
    })

    mockContactFind
      .mockReturnValueOnce({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      .mockReturnValueOnce({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              bookingId: booking._id,
              nombre: "Ana Clínica",
              telefono: "600123123",
              clinica: "Clínica Centro",
              email: "ana@clinic.com",
              mensaje: "Reserva confirmada",
              roi: null,
            },
          ]),
        }),
      })

    const { GET } = await import("@/app/api/admin/overview/route")
    const response = await GET(new Request("http://localhost/api/admin/overview"))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.recentBookings).toHaveLength(1)
    expect(payload.recentBookings[0].reservationUrl).toBe(
      `/contacto?booking_id=${booking._id}&booking_token=${booking.accessToken}`,
    )
    expect(payload.recentBookings[0].googleMeetLink).toBe("https://meet.google.com/test-shared-link")
  })
})
