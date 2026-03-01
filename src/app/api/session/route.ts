import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { Session } from "@/models/Session"
import { verifyRecaptchaToken } from "@/lib/recaptcha-server"

interface SessionLeanView {
  _id: { toString(): string }
  token: string
  expiresAt: Date | string
  roi?: {
    monthlyPatients?: number | null
    averageTicket?: number | null
    conversionLoss?: number | null
    roi?: number | null
  }
}

const sessionSchema = z.object({
  recaptchaToken: z.string().min(10),
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
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
    const recaptcha = await verifyRecaptchaToken({
      token: parsed.recaptchaToken,
      action: "session_create",
      minScore: 0.45,
      ip,
    })
    if (!recaptcha.ok) {
      return NextResponse.json({ error: recaptcha.reason || "reCAPTCHA validation failed" }, { status: 400 })
    }

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
    const rawSession = await Session.findOne({ token }).lean<SessionLeanView>()
    const session = Array.isArray(rawSession) ? rawSession[0] : rawSession

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
