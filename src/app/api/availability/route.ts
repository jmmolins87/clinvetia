import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { Booking } from "@/models/Booking"

const querySchema = z.object({
  date: z.string().datetime().optional(),
})

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30",
]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = querySchema.parse({ date: searchParams.get("date") || undefined })

    if (!parsed.date) {
      return NextResponse.json({ slots: TIME_SLOTS, unavailable: [] })
    }

    const date = new Date(parsed.date)
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    const start = new Date(date)
    start.setHours(0, 0, 0, 0)

    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    await dbConnect()

    const bookings = await Booking.find({ date: { $gte: start, $lte: end }, status: "confirmed" })
      .select("time")
      .lean()

    const unavailable = bookings.map((b) => b.time)

    return NextResponse.json({ slots: TIME_SLOTS, unavailable })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
