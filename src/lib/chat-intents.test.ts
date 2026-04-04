import { describe, expect, it } from "vitest"

import { detectChatIntents, wantsRoiCalculator } from "@/lib/chat-intents"

describe("detectChatIntents", () => {
  it("keeps booking intent when the message starts with a discourse 'no' but confirms a booking", () => {
    expect(detectChatIntents("no, vamos a reservar una demo")).toEqual({
      wantsBooking: true,
      wantsReschedule: false,
      wantsCancel: false,
    })
  })

  it("detects direct demo requests as booking intent", () => {
    expect(detectChatIntents("quiero una demo")).toEqual({
      wantsBooking: true,
      wantsReschedule: false,
      wantsCancel: false,
    })
  })

  it("keeps booking intent for affirmative follow-ups about demos", () => {
    expect(detectChatIntents("sí, quiero reservar una demo")).toEqual({
      wantsBooking: true,
      wantsReschedule: false,
      wantsCancel: false,
    })
  })

  it("detects direct booking negation", () => {
    expect(detectChatIntents("no quiero reservar ahora")).toEqual({
      wantsBooking: false,
      wantsReschedule: false,
      wantsCancel: false,
    })
  })

  it("detects reschedule intent even with common misspellings", () => {
    expect(detectChatIntents("quiero reagendare esta cita con este id")).toEqual({
      wantsBooking: true,
      wantsReschedule: true,
      wantsCancel: false,
    })
  })

  it("detects explicit requests to reopen the ROI calculator", () => {
    expect(wantsRoiCalculator("abre de nuevo la calculadora por favor")).toBe(true)
  })

  it("does not confuse generic product questions with calculator reopen requests", () => {
    expect(wantsRoiCalculator("explícame la calculadora ROI")).toBe(false)
  })
})
