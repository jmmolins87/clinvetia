import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { Session } from "@/models/Session"

const sessionSchema = z.object({
  roi: z
    .object({
      monthlyPatients: z.number().optional(),
      averageTicket: z.number().optional(),
      conversionLoss: z.number().optional(),
      roi: z.number().optional(),
    })
    .optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = sessionSchema.parse(body)

    await dbConnect()

    const accessToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await Session.create({
      token: accessToken,
      expiresAt,
      roi: parsed.roi ?? {},
    })

    return NextResponse.json({
      accessToken,
      expiresAt: expiresAt.toISOString(),
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
    const token = req.headers.get("x-session-token") || searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Missing session token" }, { status: 400 })
    }

    await dbConnect()
    const session = await Session.findOne({ token }).lean()

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Session expired" }, { status: 410 })
    }

    return NextResponse.json({
      accessToken: session.token,
      expiresAt: new Date(session.expiresAt).toISOString(),
      roi: session.roi ?? {},
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
