import { beforeEach, describe, expect, it, vi } from "vitest"

const dbConnect = vi.fn()
const findOne = vi.fn()
const create = vi.fn()

vi.mock("@/lib/db", () => ({
  dbConnect,
}))

vi.mock("@/models/VetAppointment", () => ({
  VetAppointment: {
    findOne,
    create,
  },
}))

describe("POST /api/ai/vet/bookings", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.AI_INTEGRATION_API_KEY = "test-key"
  })

  it("creates a confirmed urgent booking when the slot is free", async () => {
    findOne.mockResolvedValue(null)
    create.mockResolvedValue({
      _id: { toString: () => "booking-123" },
      ownerName: "Laura Perez",
      email: "laura@email.com",
      phone: "600111222",
      petName: "Toby",
      species: "perro",
      reason: "vomitos desde esta manana",
      priority: "urgent",
      date: new Date("2026-03-20T00:00:00.000Z"),
      time: "09:30",
      duration: 30,
      status: "confirmed",
      notes: "sin sangre",
    })

    const { POST } = await import("./route")
    const request = new Request("http://localhost/api/ai/vet/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-key",
      },
      body: JSON.stringify({
        ownerName: "Laura Perez",
        email: "laura@email.com",
        phone: "600111222",
        petName: "Toby",
        species: "perro",
        reason: "vomitos desde esta manana",
        priority: "urgent",
        date: "2026-03-20",
        time: "09:30",
        notes: "sin sangre",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(dbConnect).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledTimes(1)
    expect(data.ok).toBe(true)
    expect(data.booking.id).toBe("booking-123")
    expect(data.booking.priority).toBe("urgent")
    expect(data.booking.status).toBe("confirmed")
  })

  it("rejects a booking when the slot is already occupied", async () => {
    findOne.mockResolvedValue({ _id: "existing-booking" })

    const { POST } = await import("./route")
    const request = new Request("http://localhost/api/ai/vet/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "test-key",
      },
      body: JSON.stringify({
        ownerName: "Laura Perez",
        email: "laura@email.com",
        phone: "600111222",
        petName: "Toby",
        species: "perro",
        reason: "revision",
        priority: "normal",
        date: "2026-03-20",
        time: "10:00",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(create).not.toHaveBeenCalled()
    expect(data.error).toMatch(/slot/i)
  })
})
