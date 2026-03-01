import { NextResponse } from "next/server"
import { requireAdmin, isSuperAdmin } from "@/lib/admin-auth"
import { dbConnect } from "@/lib/db"
import { Booking } from "@/models/Booking"
import { buildGoogleMeetLink } from "@/lib/booking-communication"
import { recordAdminAudit } from "@/lib/admin-audit"

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isSuperAdmin(auth.data.admin.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await dbConnect()

  const bookings = await Booking.find({
    $or: [{ googleMeetLink: null }, { googleMeetLink: "" }, { googleMeetLink: { $exists: false } }],
  })
    .select("_id")
    .lean()

  if (!bookings.length) {
    return NextResponse.json({ ok: true, updated: 0, totalMissing: 0 })
  }

  const operations = bookings.map((booking) => {
    const id = String(booking._id)
    return {
      updateOne: {
        filter: { _id: booking._id },
        update: { $set: { googleMeetLink: buildGoogleMeetLink(id) } },
      },
    }
  })

  const result = await Booking.bulkWrite(operations, { ordered: false })

  try {
    await recordAdminAudit({
      adminId: auth.data.admin.id,
      action: "UPDATE_BOOKING_STATUS",
      targetType: "booking",
      targetId: "backfill-google-meet",
      metadata: {
        operation: "BACKFILL_GOOGLE_MEET_LINK",
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    })
  } catch {}

  return NextResponse.json({
    ok: true,
    totalMissing: bookings.length,
    updated: result.modifiedCount,
  })
}
