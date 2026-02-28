import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { User } from "@/models/User"
import { requireAdmin } from "@/lib/admin-auth"
import { canManageRole, isAdminRole, type AdminRole } from "@/lib/admin-roles"
import { recordAdminAudit } from "@/lib/admin-audit"

const updateSchema = z.object({
  name: z.string().min(2).max(80),
  role: z.string(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const parsed = updateSchema.parse(body)

    if (!isAdminRole(parsed.role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
    }
    if (parsed.role === "demo") {
      return NextResponse.json({ error: "No se puede asignar el rol demo" }, { status: 403 })
    }

    await dbConnect()
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const actorRole = auth.data.admin.role as AdminRole
    const targetRole = isAdminRole(user.role) ? user.role : null
    if (!targetRole || !canManageRole(actorRole, targetRole)) {
      return NextResponse.json({ error: "No puedes editar este usuario" }, { status: 403 })
    }
    if (!canManageRole(actorRole, parsed.role)) {
      return NextResponse.json({ error: "No puedes asignar ese rol" }, { status: 403 })
    }

    user.name = parsed.name
    user.role = parsed.role
    await user.save()

    await recordAdminAudit({
      adminId: auth.data.admin.id,
      action: "UPDATE_USER",
      targetType: "user",
      targetId: id,
      metadata: { email: user.email, role: user.role },
    })

    return NextResponse.json({
      ok: true,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
