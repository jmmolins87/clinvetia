import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { User } from "@/models/User"
import { hashPassword } from "@/lib/auth"
import { requireAdmin } from "@/lib/admin-auth"
import { recordAdminAudit } from "@/lib/admin-audit"
import { canManageRole, isAdminRole, type AdminRole } from "@/lib/admin-roles"
import { AdminUserActionToken } from "@/models/AdminUserActionToken"
import { sendBrevoEmail } from "@/lib/brevo"
import { adminUserResetPasswordEmail } from "@/lib/emails"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id } = await params
    await req.json().catch(() => null)

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

    const generatedPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 12)
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await AdminUserActionToken.create({
      token,
      type: "reset_user_password",
      status: "pending",
      expiresAt,
      requestedByAdminId: auth.data.admin.id,
      requestedByRole: actorRole,
      payload: {
        email: user.email,
        targetUserId: user._id,
        passwordHash: hashPassword(generatedPassword),
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const confirmUrl = `${appUrl}/admin/confirm-user-action?token=${encodeURIComponent(token)}`
    const supportEmail = process.env.BREVO_REPLY_TO || "info@clinvetia.com"
    const emailResult = await sendBrevoEmail({
      to: [{ email: user.email, name: user.name }],
      subject: "Confirma el cambio de password de tu acceso",
      htmlContent: adminUserResetPasswordEmail({
        brandName: "Clinvetia",
        recipientName: user.name,
        recipientEmail: user.email,
        generatedPassword,
        confirmUrl,
        supportEmail,
      }),
      replyTo: { email: supportEmail },
    })
    if (!emailResult.ok) {
      await AdminUserActionToken.deleteOne({ token })
      return NextResponse.json({ error: emailResult.error || "No se pudo enviar el correo de verificación" }, { status: 502 })
    }

    await recordAdminAudit({
      adminId: auth.data.admin.id,
      action: "REQUEST_RESET_PASSWORD",
      targetType: "user",
      targetId: id,
      metadata: { email: user.email, expiresAt: expiresAt.toISOString() },
    })

    return NextResponse.json({ ok: true, pending: true, expiresAt: expiresAt.toISOString() })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
