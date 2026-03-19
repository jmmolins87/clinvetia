import { NextResponse } from "next/server"
import { z } from "zod"
import { authenticateAgentRequest } from "@/lib/agent-api-auth"
import { dbConnect } from "@/lib/db"
import { isBookableVetTimeSlot, isValidVetTimeSlot, type VetBookingPriority } from "@/lib/vet-schedule"
import { VetAppointment } from "@/models/VetAppointment"

const bookingSchema = z.object({
  ownerName: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().min(7).max(25),
  petName: z.string().min(1).max(80),
  species: z.string().min(2).max(40),
  reason: z.string().min(3).max(500),
  priority: z.enum(["normal", "urgent"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duration: z.number().int().min(15).max(120).optional(),
  notes: z.string().max(500).optional(),
})

export async function POST(req: Request) {
  const auth = authenticateAgentRequest(req)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const parsed = bookingSchema.parse(body)

    if (!isValidVetTimeSlot(parsed.time)) {
      return NextResponse.json({ error: "Invalid time slot" }, { status: 400 })
    }

    if (!isBookableVetTimeSlot(parsed.time, parsed.priority as VetBookingPriority)) {
      return NextResponse.json({ error: "Time slot is not bookable for this priority" }, { status: 409 })
    }

    const date = new Date(`${parsed.date}T00:00:00.000Z`)
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    const start = new Date(date)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    await dbConnect()

    const existing = await VetAppointment.findOne({
      date: { $gte: start, $lte: end },
      time: parsed.time,
      status: "confirmed",
    })

    if (existing) {
      return NextResponse.json({ error: "Time slot unavailable" }, { status: 409 })
    }

    const booking = await VetAppointment.create({
      ownerName: parsed.ownerName,
      email: parsed.email,
      phone: parsed.phone,
      petName: parsed.petName,
      species: parsed.species,
      reason: parsed.reason,
      priority: parsed.priority,
      date,
      time: parsed.time,
      duration: parsed.duration ?? 30,
      status: "confirmed",
      channel: "n8n_agent",
      notes: parsed.notes || "",
    })

    return NextResponse.json({
      ok: true,
      booking: {
        id: booking._id.toString(),
        ownerName: booking.ownerName,
        email: booking.email,
        phone: booking.phone,
        petName: booking.petName,
        species: booking.species,
        reason: booking.reason,
        priority: booking.priority,
        date: booking.date.toISOString(),
        time: booking.time,
        duration: booking.duration,
        status: booking.status,
        notes: booking.notes,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    )
  }
}
