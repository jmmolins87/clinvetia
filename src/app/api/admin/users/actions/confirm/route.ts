import { NextResponse } from "next/server"
import { z } from "zod"

import { dbConnect } from "@/lib/db"
import { User } from "@/models/User"
import { AdminUserActionToken } from "@/models/AdminUserActionToken"
import { isAdminRole } from "@/lib/admin-roles"

const schema = z.object({
  token: z.string().min(10),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.parse(body)

    await dbConnect()

    const actionToken = await AdminUserActionToken.findOne({ token: parsed.token, status: "pending" })
    if (!actionToken) {
      return NextResponse.json({ error: "Solicitud no válida o ya utilizada" }, { status: 404 })
    }
    if (new Date(actionToken.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "La solicitud ha expirado" }, { status: 410 })
    }

    if (actionToken.type === "invite_user") {
      const { email, name, role, passwordHash } = actionToken.payload ?? {}
      if (!email || !name || !role || !passwordHash || !isAdminRole(role)) {
        return NextResponse.json({ error: "Datos de invitación inválidos" }, { status: 400 })
      }

      const exists = await User.findOne({ email }).lean()
      if (exists) {
        return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 })
      }

      await User.create({
        email,
        name,
        role,
        passwordHash,
        status: "active",
      })
    } else if (actionToken.type === "reset_user_password") {
      const { targetUserId, passwordHash } = actionToken.payload ?? {}
      if (!targetUserId || !passwordHash) {
        return NextResponse.json({ error: "Datos de reset inválidos" }, { status: 400 })
      }
      const user = await User.findById(targetUserId)
      if (!user) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }
      user.passwordHash = passwordHash
      await user.save()
    } else {
      return NextResponse.json({ error: "Tipo de solicitud no soportado" }, { status: 400 })
    }

    actionToken.status = "used"
    actionToken.usedAt = new Date()
    await actionToken.save()

    return NextResponse.json({ ok: true, type: actionToken.type })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 })
  }
}

