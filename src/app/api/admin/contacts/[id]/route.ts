import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin-auth"
import { listDemoContactsWithBookings } from "@/lib/admin-demo-bookings-state"
import { dbConnect } from "@/lib/db"
import { buildContactWorkspace } from "@/lib/contact-workspace"
import { Booking } from "@/models/Booking"
import { Contact } from "@/models/Contact"

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(_req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  if (auth.data.admin.role === "demo") {
    const contact = listDemoContactsWithBookings().find((item) => item.id === id)
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }
    return NextResponse.json(buildContactWorkspace(contact))
  }

  await dbConnect()
  const contact = await Contact.findById(id).lean()
  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 })
  }

  const booking = contact.bookingId ? await Booking.findById(contact.bookingId).lean() : null

  return NextResponse.json(
    buildContactWorkspace({
      id: String(contact._id),
      nombre: contact.nombre,
      email: contact.email,
      telefono: contact.telefono,
      clinica: contact.clinica,
      mensaje: contact.mensaje,
      roi: contact.roi ?? {},
      createdAt: contact.createdAt.toISOString(),
      booking: booking
        ? {
            id: String(booking._id),
            date: booking.date.toISOString(),
            time: booking.time,
            duration: booking.duration,
            status: booking.status,
          }
        : null,
    })
  )
}
