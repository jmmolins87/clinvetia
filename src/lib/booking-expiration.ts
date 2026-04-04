import { Booking } from "@/models/Booking"

export async function expireOverdueBookings() {
  const now = new Date()
  const overdueBookings = await Booking.find({
    status: { $in: ["pending", "confirmed"] },
    demoExpiresAt: { $lte: now },
  })
    .select("_id")
    .lean<Array<{ _id: unknown }>>()

  return Booking.updateMany(
    {
      _id: { $in: overdueBookings.map((booking) => booking._id) },
    },
    { $set: { status: "expired" } }
  )
}
