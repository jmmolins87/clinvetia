import { beforeEach, describe, expect, it, vi } from "vitest"

const dbConnect = vi.fn()
const find = vi.fn()

vi.mock("@/lib/db", () => ({
  dbConnect,
}))

vi.mock("@/models/VetAppointment", () => ({
  VetAppointment: {
    find,
  },
}))

describe("GET /api/ai/vet/availability", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.AI_INTEGRATION_API_KEY = "test-key"
  })

  it("returns normal bookable slots excluding already reserved times", async () => {
    find.mockReturnValue({
      lean: vi.fn().mockResolvedValue([{ time: "10:30" }, { time: "16:00" }]),
    })

    const { GET } = await import("./route")
    const request = new Request("http://localhost/api/ai/vet/availability?date=2026-03-20&priority=normal", {
      headers: { "x-api-key": "test-key" },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(dbConnect).toHaveBeenCalledTimes(1)
    expect(data.priority).toBe("normal")
    expect(data.bookable).toContain("10:00")
    expect(data.bookable).not.toContain("10:30")
    expect(data.bookable).not.toContain("16:00")
    expect(data.unavailable).toEqual(expect.arrayContaining(["10:30", "16:00"]))
  })
})
