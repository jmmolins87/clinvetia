import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { User } from "@/models/User"
import { requireAdmin } from "@/lib/admin-auth"
import { recordAdminAudit } from "@/lib/admin-audit"
import { canManageRole, isAdminRole, type AdminRole } from "@/lib/admin-roles"

const schema = z.object({
  status: z.enum(["active", "disabled"]),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const parsed = schema.parse(body)

    await dbConnect()
    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const actorRole = auth.data.admin.role as AdminRole
    const targetRole = isAdminRole(user.role) ? user.role : null
    if (!targetRole || !canManageRole(actorRole, targetRole)) {
      return NextResponse.json({ error: "No puedes editar este usuario" }, { status: 403 })
    }

    user.status = parsed.status
    await user.save()

    await recordAdminAudit({
      adminId: auth.data.admin.id,
      action: parsed.status === "disabled" ? "DISABLE_USER" : "ENABLE_USER",
      targetType: "user",
      targetId: params.id,
      metadata: { email: user.email, status: parsed.status },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
