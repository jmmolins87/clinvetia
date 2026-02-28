import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { Booking } from "@/models/Booking"

const expireSchema = z.object({
  bookingId: z.string().min(1),
  accessToken: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = expireSchema.parse(body)

    await dbConnect()

    const booking = await Booking.findById(parsed.bookingId)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.accessToken !== parsed.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    booking.status = "expired"
    booking.sessionToken = null
    booking.demoExpiresAt = new Date()
    booking.expiresAt = new Date()
    booking.formExpiresAt = new Date()
    await booking.save()

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
