import { NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { User } from "@/models/User"
import { hashPassword } from "@/lib/auth"
import { recordAdminAudit } from "@/lib/admin-audit"
import { requireAdmin } from "@/lib/admin-auth"
import { ADMIN_ROLES, canManageRole, isAdminRole, type AdminRole } from "@/lib/admin-roles"
import { AdminUserActionToken } from "@/models/AdminUserActionToken"
import { sendBrevoEmail } from "@/lib/brevo"
import { adminUserInviteEmail } from "@/lib/emails"

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  role: z.enum(ADMIN_ROLES),
})

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.data.admin.role === "demo") {
    return NextResponse.json({
      users: [
        {
          email: auth.data.admin.email,
          name: auth.data.admin.name,
          role: "demo",
          status: "active",
          createdAt: new Date().toISOString(),
        },
      ],
    })
  }

  await dbConnect()
  const users = await User.find().select("email name role status createdAt").lean()
  return NextResponse.json({
    users: users.map((u) => ({
      id: String(u._id),
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    })),
  })
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const parsed = userSchema.parse(body)
    if (parsed.role === "demo") {
      return NextResponse.json({ error: "El usuario demo solo existe como usuario único del sistema" }, { status: 403 })
    }
    const actorRole = auth.data.admin.role as AdminRole
    if (!canManageRole(actorRole, parsed.role)) {
      return NextResponse.json({ error: "No puedes crear usuarios con ese rol" }, { status: 403 })
    }

    await dbConnect()

    const exists = await User.findOne({ email: parsed.email }).lean()
    if (exists) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const pendingInvite = await AdminUserActionToken.findOne({
      type: "invite_user",
      status: "pending",
      "payload.email": parsed.email,
      expiresAt: { $gt: new Date() },
    }).lean()
    if (pendingInvite) {
      return NextResponse.json({ error: "Ya existe una invitación pendiente para este email" }, { status: 409 })
    }

    const generatedPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 12)
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 2)

    await AdminUserActionToken.create({
      token,
      type: "invite_user",
      status: "pending",
      expiresAt,
      requestedByAdminId: auth.data.admin.id,
      requestedByRole: actorRole,
      payload: {
        email: parsed.email,
        name: parsed.name,
        role: parsed.role,
        passwordHash: hashPassword(generatedPassword),
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const confirmUrl = `${appUrl}/admin/confirm-user-action?token=${encodeURIComponent(token)}`
    const supportEmail = process.env.BREVO_REPLY_TO || "info@clinvetia.com"
    const emailResult = await sendBrevoEmail({
      to: [{ email: parsed.email, name: parsed.name }],
      subject: "Confirma tu acceso a Clinvetia",
      htmlContent: adminUserInviteEmail({
        brandName: "Clinvetia",
        recipientName: parsed.name,
        recipientEmail: parsed.email,
        role: parsed.role,
        generatedPassword,
        confirmUrl,
        supportEmail,
      }),
      replyTo: { email: supportEmail },
    })
    if (!emailResult.ok) {
      await AdminUserActionToken.deleteOne({ token })
      return NextResponse.json({ error: emailResult.error || "No se pudo enviar el correo de invitación" }, { status: 502 })
    }

    await recordAdminAudit({
      adminId: auth.data.admin.id,
      action: "INVITE_USER",
      targetType: "user_invitation",
      targetId: token,
      metadata: { email: parsed.email, role: parsed.role, expiresAt: expiresAt.toISOString() },
    })

    return NextResponse.json({
      ok: true,
      pending: true,
      email: parsed.email,
      role: parsed.role,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  await dbConnect()
  const target = await User.findById(id)
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  const actorRole = auth.data.admin.role as AdminRole
  const targetRole = isAdminRole(target.role) ? target.role : null
  if (!targetRole || !canManageRole(actorRole, targetRole)) {
    return NextResponse.json({ error: "No puedes eliminar este usuario" }, { status: 403 })
  }
  const deleted = await User.findByIdAndDelete(id)
  if (deleted) {
    await recordAdminAudit({
      adminId: auth.data.admin.id,
      action: "DELETE_USER",
      targetType: "user",
      targetId: id,
      metadata: { email: deleted.email },
    })
  }
  return NextResponse.json({ ok: true })
}
