import { NextResponse } from "next/server"
import { z } from "zod"
import { authenticateAgentRequest } from "@/lib/agent-api-auth"
import { dbConnect } from "@/lib/db"
import { getVetBookableSlots, VET_ALL_TIME_SLOTS, type VetBookingPriority } from "@/lib/vet-schedule"
import { VetAppointment } from "@/models/VetAppointment"

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priority: z.enum(["normal", "urgent"]).optional(),
})

export async function GET(req: Request) {
  const auth = authenticateAgentRequest(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const parsed = querySchema.parse({
      date: searchParams.get("date"),
      priority: searchParams.get("priority") || undefined,
    })

    const priority = (parsed.priority || "normal") as VetBookingPriority
    const date = new Date(`${parsed.date}T00:00:00.000Z`)
    const start = new Date(date)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    await dbConnect()

    const appointments = await VetAppointment.find({
      date: { $gte: start, $lte: end },
      status: "confirmed",
    }).lean<{ time: string }[]>()

    const unavailable = Array.from(new Set(appointments.map((appointment) => appointment.time))).sort()
    const bookable = getVetBookableSlots(priority).filter((time) => !unavailable.includes(time))

    return NextResponse.json({
      date: parsed.date,
      priority,
      slots: VET_ALL_TIME_SLOTS,
      unavailable,
      bookable,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query", details: error.flatten() }, { status: 400 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    )
  }
}
