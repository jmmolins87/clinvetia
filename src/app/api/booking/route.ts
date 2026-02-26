import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { Booking } from "@/models/Booking"
import { Contact } from "@/models/Contact"

const bookingSchema = z.object({
  date: z.string().datetime(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duration: z.number().int().min(15).max(120),
  sessionToken: z.string().optional().nullable(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = bookingSchema.parse(body)

    await dbConnect()

    const date = new Date(parsed.date)
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    const [hour, min] = parsed.time.split(":").map(Number)
    const demoDateTime = new Date(date)
    demoDateTime.setHours(hour, min, 0, 0)

    const demoExpiresAt = new Date(demoDateTime)
    demoExpiresAt.setMinutes(demoExpiresAt.getMinutes() + parsed.duration)

    const expiresAt = new Date(date)
    expiresAt.setHours(23, 59, 59, 999)

    const formExpiresAt = new Date()
    formExpiresAt.setMinutes(formExpiresAt.getMinutes() + 10)

    const start = new Date(date)
    start.setHours(0, 0, 0, 0)

    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    if (parsed.sessionToken) {
      const activeBooking = await Booking.findOne({
        sessionToken: parsed.sessionToken,
        demoExpiresAt: { $gt: new Date() },
        status: { $in: ["pending", "confirmed"] },
      }).lean()

      if (activeBooking) {
        return NextResponse.json(
          {
            error: "Ya tienes una demo reservada activa. Gestiona cambios desde el correo de confirmacion.",
            bookingId: activeBooking._id.toString(),
            demoExpiresAt: activeBooking.demoExpiresAt.toISOString(),
          },
          { status: 409 }
        )
      }
    }

    const conflict = await Booking.findOne({
      date: { $gte: start, $lte: end },
      time: parsed.time,
      status: "confirmed",
    }).lean()

    if (conflict) {
      return NextResponse.json({ error: "Slot unavailable" }, { status: 409 })
    }

    const accessToken = crypto.randomUUID()

    const booking = await Booking.create({
      date,
      time: parsed.time,
      duration: parsed.duration,
      sessionToken: parsed.sessionToken ?? null,
      accessToken,
      expiresAt,
      formExpiresAt,
      demoExpiresAt,
      status: "confirmed",
    })

    return NextResponse.json({
      bookingId: booking._id.toString(),
      accessToken,
      date: booking.date.toISOString(),
      time: booking.time,
      duration: booking.duration,
      expiresAt: booking.expiresAt.toISOString(),
      formExpiresAt: booking.formExpiresAt.toISOString(),
      demoExpiresAt: booking.demoExpiresAt.toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get("bookingId")
    const token = req.headers.get("x-booking-token") || searchParams.get("token")
    const sessionToken = req.headers.get("x-session-token") || searchParams.get("sessionToken")

    await dbConnect()

    if (sessionToken && (!bookingId || !token)) {
      const activeBooking = await Booking.findOne({
        sessionToken,
        demoExpiresAt: { $gt: new Date() },
        status: { $in: ["pending", "confirmed"] },
      })
        .sort({ createdAt: -1 })
        .lean()

      if (!activeBooking) {
        return NextResponse.json({ error: "Active booking not found" }, { status: 404 })
      }

      const existingContact =
        (await Contact.findOne({ bookingId: { $in: [activeBooking._id, activeBooking._id.toString()] } })
          .select("nombre email telefono clinica mensaje roi createdAt")
          .lean()) ||
        (activeBooking.sessionToken
          ? await Contact.findOne({ sessionToken: activeBooking.sessionToken })
              .sort({ createdAt: -1 })
              .select("nombre email telefono clinica mensaje roi createdAt")
              .lean()
          : null)

      return NextResponse.json({
        bookingId: activeBooking._id.toString(),
        accessToken: activeBooking.accessToken,
        date: activeBooking.date.toISOString(),
        time: activeBooking.time,
        duration: activeBooking.duration,
        expiresAt: activeBooking.expiresAt.toISOString(),
        formExpiresAt: activeBooking.formExpiresAt.toISOString(),
        demoExpiresAt: activeBooking.demoExpiresAt.toISOString(),
        status: activeBooking.status,
        contactSubmitted: Boolean(existingContact),
        contact: existingContact
          ? {
              nombre: existingContact.nombre,
              email: existingContact.email,
              telefono: existingContact.telefono,
              clinica: existingContact.clinica,
              mensaje: existingContact.mensaje,
              roi: existingContact.roi ?? null,
              createdAt: existingContact.createdAt ? new Date(existingContact.createdAt).toISOString() : null,
            }
          : null,
      })
    }

    if (!bookingId || !token) {
      return NextResponse.json({ error: "Missing bookingId/token or sessionToken" }, { status: 400 })
    }

    const booking = await Booking.findById(bookingId).lean()

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.accessToken !== token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const existingContact =
      (await Contact.findOne({ bookingId: { $in: [booking._id, booking._id.toString()] } })
        .select("nombre email telefono clinica mensaje roi createdAt")
        .lean()) ||
      (booking.sessionToken
        ? await Contact.findOne({ sessionToken: booking.sessionToken })
            .sort({ createdAt: -1 })
            .select("nombre email telefono clinica mensaje roi createdAt")
            .lean()
        : null)

    return NextResponse.json({
      bookingId: booking._id.toString(),
      date: booking.date.toISOString(),
      time: booking.time,
      duration: booking.duration,
      expiresAt: booking.expiresAt.toISOString(),
      formExpiresAt: booking.formExpiresAt.toISOString(),
      demoExpiresAt: booking.demoExpiresAt.toISOString(),
      status: booking.status,
      contactSubmitted: Boolean(existingContact),
      contact: existingContact
        ? {
            nombre: existingContact.nombre,
            email: existingContact.email,
            telefono: existingContact.telefono,
            clinica: existingContact.clinica,
            mensaje: existingContact.mensaje,
            roi: existingContact.roi ?? null,
            createdAt: existingContact.createdAt ? new Date(existingContact.createdAt).toISOString() : null,
          }
        : null,
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
