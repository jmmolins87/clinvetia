import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { Contact } from "@/models/Contact"
import { Booking } from "@/models/Booking"
import { dbConnect } from "@/lib/db"
import { canManageRole, isAdminRole, type AdminRole } from "@/lib/admin-roles"
import { clearRoiForLeadContext } from "@/lib/roi-cleanup"
import { deleteDemoBooking, deleteDemoContact, listDemoContactsWithBookings } from "@/lib/admin-demo-bookings-state"

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.data.admin.role === "demo") {
    return NextResponse.json({ contacts: listDemoContactsWithBookings() })
  }

  await dbConnect()
  const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean()
  const bookingIds = contacts
    .map((c) => c.bookingId)
    .filter(Boolean)
    .map((id) => String(id))

  const bookings = bookingIds.length
    ? await Booking.find({ _id: { $in: bookingIds } }).lean()
    : []
  const bookingsById = new Map(bookings.map((b) => [String(b._id), b]))

  return NextResponse.json({
    contacts: contacts.map((c) => ({
      id: String(c._id),
      nombre: c.nombre,
      email: c.email,
      telefono: c.telefono,
      clinica: c.clinica,
      mensaje: c.mensaje,
      roi: c.roi ?? {},
      booking: c.bookingId
        ? (() => {
            const b = bookingsById.get(String(c.bookingId))
            return b
              ? {
                  id: String(b._id),
                  date: b.date.toISOString(),
                  time: b.time,
                  duration: b.duration,
                  status: b.status,
                }
              : null
          })()
        : null,
      createdAt: c.createdAt.toISOString(),
    })),
  })
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (auth.data.admin.role === "demo") {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }
    const contacts = listDemoContactsWithBookings()
    const target = contacts.find((contact) => contact.id === id) || null
    if (!target) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }
    if (target.booking?.id) {
      deleteDemoBooking(target.booking.id)
    }
    deleteDemoContact(id)
    return NextResponse.json({ ok: true })
  }

  const actorRole = auth.data.admin.role as AdminRole
  if (!isAdminRole(actorRole) || !canManageRole(actorRole, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  await dbConnect()
  const contact = await Contact.findById(id)
  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 })
  }
  await clearRoiForLeadContext({
    contactId: String(contact._id),
    bookingId: contact.bookingId ? String(contact.bookingId) : null,
    sessionToken: contact.sessionToken ? String(contact.sessionToken) : null,
  })
  await Contact.deleteOne({ _id: contact._id })
  return NextResponse.json({ ok: true })
}
