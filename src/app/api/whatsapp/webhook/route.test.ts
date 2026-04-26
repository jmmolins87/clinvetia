import { beforeEach, describe, expect, it, vi } from "vitest"

const mockDbConnect = vi.fn()
const mockConversationFindOne = vi.fn()
const mockConversationUpdateOne = vi.fn()
const mockSendWhatsAppText = vi.fn()
const mockCallN8nWhatsAppWebhook = vi.fn()

vi.mock("@/lib/db", () => ({
  dbConnect: mockDbConnect,
}))

vi.mock("@/models/WhatsAppConversation", () => ({
  WhatsAppConversation: {
    findOne: mockConversationFindOne,
    updateOne: mockConversationUpdateOne,
  },
}))

vi.mock("@/models/Session", () => ({
  Session: {
    create: vi.fn(),
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}))

vi.mock("@/lib/n8n-integration", () => ({
  isN8nWhatsAppConfigured: () => true,
  callN8nWhatsAppWebhook: mockCallN8nWhatsAppWebhook,
}))

vi.mock("@/lib/kapso-whatsapp", () => ({
  sendWhatsAppText: mockSendWhatsAppText,
}))

describe("POST /api/whatsapp/webhook", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockDbConnect.mockResolvedValue(undefined)
    mockConversationFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    })
    mockConversationUpdateOne.mockResolvedValue(undefined)
    mockSendWhatsAppText.mockResolvedValue({ ok: true, provider: "kapso", skipped: false })
    mockCallN8nWhatsAppWebhook.mockResolvedValue({
      ok: false,
      status: 502,
      error: "N8N request failed",
      data: null,
    })
  })

  it("falls back to local handling when n8n fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            reply: "Hola, te ayudo ahora mismo.",
            state: { intent: "none", step: "idle" },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    )

    const { POST } = await import("./route")

    const request = new Request("http://localhost/api/whatsapp/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "whatsapp.message.received",
        conversation: {
          phone_number: "+34 600 111 222",
        },
        message: {
          type: "text",
          text: { body: "Hola Moka" },
          kapso: {
            direction: "inbound",
            content: "Hola Moka",
          },
          timestamp: "2026-04-26T10:00:00.000Z",
        },
        phone_number_id: "1131536336707887",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(mockCallN8nWhatsAppWebhook).toHaveBeenCalledTimes(1)
    expect(mockSendWhatsAppText).toHaveBeenCalledWith("34600111222", "Hola, te ayudo ahora mismo.")
    expect(mockConversationUpdateOne).toHaveBeenCalled()
  })
})
