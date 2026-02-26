import { NextResponse } from "next/server"
import { z } from "zod"

import { dbConnect } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { AdminUserActionToken } from "@/models/AdminUserActionToken"
import { User } from "@/models/User"
import { canManageRole, isAdminRole, type AdminRole } from "@/lib/admin-roles"
import { sendBrevoEmail } from "@/lib/brevo"
import { adminUserInviteEmail, adminUserResetPasswordEmail } from "@/lib/emails"
import { hashPassword } from "@/lib/auth"
import { recordAdminAudit } from "@/lib/admin-audit"

interface AdminTargetUserRoleView {
  _id: { toString(): string }
  role: string
  email: string
  name: string
}

interface AdminTargetUserContactView {
  _id: { toString(): string }
  email: string
  name: string
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("cancel"),
    id: z.string().min(1),
  }),
  z.object({
    action: z.literal("resend"),
    id: z.string().min(1),
  }),
])

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await dbConnect()
  const actorRole = auth.data.admin.role as AdminRole

  const pending = await AdminUserActionToken.find({ status: "pending", expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .lean()

  const targetIds = pending
    .filter((item) => item.type === "reset_user_password" && item.payload?.targetUserId)
    .map((item) => String(item.payload?.targetUserId))

  const resetTargets = targetIds.length
    ? await User.find({ _id: { $in: targetIds } }).select("role").lean()
    : []

  const resetRoleById = new Map(resetTargets.map((user) => [String(user._id), user.role]))

  const filtered = pending.filter((item) => {
    if (item.type === "invite_user") {
      const targetRole = isAdminRole(item.payload?.role) ? item.payload.role : null
      return !!targetRole && canManageRole(actorRole, targetRole)
    }
    if (item.type === "reset_user_password") {
      const targetId = item.payload?.targetUserId ? String(item.payload.targetUserId) : null
      const targetRole = targetId ? resetRoleById.get(targetId) : null
      return !!targetRole && isAdminRole(targetRole) && canManageRole(actorRole, targetRole)
    }
    return false
  })

  return NextResponse.json({
    actions: filtered.map((item) => ({
      id: String(item._id),
      type: item.type,
      email: item.payload?.email || "",
      name: item.payload?.name || "",
      role: item.payload?.role || null,
      targetUserId: item.payload?.targetUserId ? String(item.payload.targetUserId) : null,
      createdAt: item.createdAt,
      expiresAt: item.expiresAt,
      requestedByRole: item.requestedByRole,
      status: item.status,
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
    const parsed = actionSchema.parse(body)
    const actorRole = auth.data.admin.role as AdminRole

    await dbConnect()
    const actionToken = await AdminUserActionToken.findById(parsed.id)
    if (!actionToken) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }
    if (actionToken.status !== "pending") {
      return NextResponse.json({ error: "La solicitud ya no está pendiente" }, { status: 409 })
    }

    if (actionToken.type === "invite_user") {
      const targetRole = isAdminRole(actionToken.payload?.role) ? actionToken.payload.role : null
      if (!targetRole || !canManageRole(actorRole, targetRole)) {
        return NextResponse.json({ error: "No puedes gestionar esta invitación" }, { status: 403 })
      }
    }

    if (actionToken.type === "reset_user_password" && actionToken.payload?.targetUserId) {
      const rawTargetUser = await User.findById(actionToken.payload.targetUserId)
        .select("role email name")
        .lean<AdminTargetUserRoleView>()
      const targetUser = Array.isArray(rawTargetUser) ? rawTargetUser[0] : rawTargetUser
      if (!targetUser) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }
      const targetRole = isAdminRole(targetUser.role) ? targetUser.role : null
      if (!targetRole || !canManageRole(actorRole, targetRole)) {
        return NextResponse.json({ error: "No puedes gestionar esta solicitud" }, { status: 403 })
      }
    }

    if (parsed.action === "cancel") {
      actionToken.status = "used"
      actionToken.usedAt = new Date()
      await actionToken.save()

      await recordAdminAudit({
        adminId: auth.data.admin.id,
        action: "CANCEL_USER_ACTION_TOKEN",
        targetType: "user_action_token",
        targetId: String(actionToken._id),
        metadata: { type: actionToken.type, email: actionToken.payload?.email },
      })

      return NextResponse.json({ ok: true })
    }

    const supportEmail = process.env.BREVO_REPLY_TO || "info@clinvetia.com"
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const confirmUrl = `${appUrl}/admin/confirm-user-action?token=${encodeURIComponent(actionToken.token)}`
    const generatedPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 12)

    actionToken.payload = {
      ...actionToken.payload,
      passwordHash: hashPassword(generatedPassword),
    }
    await actionToken.save()

    if (actionToken.type === "invite_user") {
      const roleValue = actionToken.payload?.role || "worker"
      const email = actionToken.payload?.email || ""
      const name = actionToken.payload?.name || email
      const emailResult = await sendBrevoEmail({
        to: [{ email, name }],
        subject: "Confirma tu acceso a Clinvetia",
        htmlContent: adminUserInviteEmail({
          brandName: "Clinvetia",
          recipientName: name,
          recipientEmail: email,
          role: roleValue,
          generatedPassword,
          confirmUrl,
          supportEmail,
        }),
        replyTo: { email: supportEmail },
      })
      if (!emailResult.ok) {
        return NextResponse.json({ error: emailResult.error || "No se pudo reenviar la invitación" }, { status: 502 })
      }
    } else {
      const email = actionToken.payload?.email || ""
      const rawUser = actionToken.payload?.targetUserId
        ? await User.findById(actionToken.payload.targetUserId).select("name email").lean<AdminTargetUserContactView>()
        : null
      const user = rawUser ? (Array.isArray(rawUser) ? rawUser[0] : rawUser) : null
      const emailResult = await sendBrevoEmail({
        to: [{ email, name: user?.name || email }],
        subject: "Confirma el cambio de password de tu acceso",
        htmlContent: adminUserResetPasswordEmail({
          brandName: "Clinvetia",
          recipientName: user?.name || email,
          recipientEmail: email,
          generatedPassword,
          confirmUrl,
          supportEmail,
        }),
        replyTo: { email: supportEmail },
      })
      if (!emailResult.ok) {
        return NextResponse.json({ error: emailResult.error || "No se pudo reenviar el email" }, { status: 502 })
      }
    }

    await recordAdminAudit({
      adminId: auth.data.admin.id,
      action: "RESEND_USER_ACTION_TOKEN",
      targetType: "user_action_token",
      targetId: String(actionToken._id),
      metadata: { type: actionToken.type, email: actionToken.payload?.email },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 })
  }
}
