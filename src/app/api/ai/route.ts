import { NextResponse } from "next/server"
import { authenticateAgentRequest } from "@/lib/agent-api-auth"

export async function GET(req: Request) {
  const auth = authenticateAgentRequest(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  return NextResponse.json({
    name: "Clinvetia AI JSON API",
    version: "1.0.0",
    auth: {
      type: "api_key",
      headers: ["Authorization: Bearer <AI_INTEGRATION_API_KEY>", "x-api-key: <AI_INTEGRATION_API_KEY>"],
    },
    endpoints: {
      dashboard: {
        method: "GET",
        path: "/api/ai/dashboard",
        query: {
          range: ["7", "30"],
        },
      },
      calendar: {
        method: "GET",
        path: "/api/ai/calendar",
        query: {
          from: "ISO date or datetime",
          to: "ISO date or datetime",
          status: "pending,confirmed,expired,cancelled",
          limit: "1-200",
        },
      },
      vetAvailability: {
        method: "GET",
        path: "/api/ai/vet/availability",
        query: {
          date: "YYYY-MM-DD",
          priority: "normal|urgent",
        },
      },
      vetBookings: {
        method: "POST",
        path: "/api/ai/vet/bookings",
        body: {
          ownerName: "string",
          email: "string",
          phone: "string",
          petName: "string",
          species: "string",
          reason: "string",
          priority: "normal|urgent",
          date: "YYYY-MM-DD",
          time: "HH:mm",
          duration: "15-120 optional",
          notes: "string optional",
        },
      },
    },
  })
}
