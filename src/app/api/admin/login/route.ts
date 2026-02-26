import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { User } from "@/models/User"
import { verifyPassword } from "@/lib/auth"
import { createAdminSession, getAdminCookieName } from "@/lib/admin-auth"
import { type AdminRole } from "@/lib/admin-roles"

interface LoginUser {
  _id: { toString(): string }
  email: string
  name: string
  role: string
  passwordHash: string
  status: "active" | "disabled"
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = loginSchema.parse(body)

    await dbConnect()

    const rawUser = await User.findOne({ email: parsed.email }).lean<LoginUser>()
    const user = Array.isArray(rawUser) ? rawUser[0] : rawUser
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (user.status !== "active") {
      return NextResponse.json({ error: "User disabled" }, { status: 403 })
    }

    if (!verifyPassword(parsed.password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const userId = String(user._id)

    const session = await createAdminSession({
      adminId: userId,
      role: user.role as AdminRole,
    })

    const res = NextResponse.json({
      id: userId,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    res.cookies.set(getAdminCookieName(), session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    })

    return res
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
