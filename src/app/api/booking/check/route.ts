import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { Booking } from "@/models/Booking"
import { Contact } from "@/models/Contact"

const querySchema = z.object({
  email: z.string().email(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = querySchema.parse({ email: searchParams.get("email") })

    await dbConnect()

    const contacts = await Contact.find({ email: parsed.email }).select("bookingId").lean()
    const bookingIds = contacts
      .map((c) => (c.bookingId ? String(c.bookingId) : null))
      .filter((id): id is string => Boolean(id))

    if (bookingIds.length === 0) {
      return NextResponse.json({ active: false })
    }

    const booking = await Booking.findOne({
      _id: { $in: bookingIds },
      demoExpiresAt: { $gt: new Date() },
      status: { $in: ["pending", "confirmed"] },
    })
      .select("demoExpiresAt")
      .lean<{ demoExpiresAt?: Date }>()

    if (!booking) {
      return NextResponse.json({ active: false })
    }

    return NextResponse.json({ active: true, demoExpiresAt: booking.demoExpiresAt ?? null })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
