import { dbConnect } from "@/lib/db"
import { AdminSession } from "@/models/AdminSession"
import { User } from "@/models/User"
import { type AdminRole, isSuperAdmin as isSuperAdminRole } from "@/lib/admin-roles"

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "clinvetia_admin_session"

interface AdminSessionLeanView {
  _id: { toString(): string }
  token: string
  adminId: { toString(): string } | string
  role: string
  expiresAt: Date | string
}

interface AdminUserLeanView {
  _id: { toString(): string }
  email: string
  name: string
  role: string
  status: "active" | "disabled"
}

function getCookie(req: Request, name: string) {
  const header = req.headers.get("cookie")
  if (!header) return null
  const parts = header.split(";")
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=")
    if (k === name) return decodeURIComponent(rest.join("="))
  }
  return null
}

export function getAdminCookieName() {
  return COOKIE_NAME
}

export async function createAdminSession(params: { adminId: string; role: AdminRole }) {
  await dbConnect()
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await AdminSession.create({
    token,
    adminId: params.adminId,
    role: params.role,
    expiresAt,
  })

  return { token, expiresAt }
}

export async function getAdminFromRequest(req: Request) {
  const token = getCookie(req, COOKIE_NAME)
  if (!token) return null

  await dbConnect()
  const rawSession = await AdminSession.findOne({ token }).lean<AdminSessionLeanView>()
  const session = Array.isArray(rawSession) ? rawSession[0] : rawSession
  if (!session) return null
  if (new Date(session.expiresAt).getTime() < Date.now()) return null

  const rawAdmin = await User.findById(session.adminId).lean<AdminUserLeanView>()
  const admin = Array.isArray(rawAdmin) ? rawAdmin[0] : rawAdmin
  if (!admin || admin.status !== "active") return null

  return {
    admin: {
      id: String(admin._id),
      email: admin.email,
      name: admin.name,
      role: admin.role as AdminRole,
    },
    session: {
      token: session.token,
      expiresAt: session.expiresAt,
      role: session.role as AdminRole,
    },
  }
}

export async function requireAdmin(req: Request) {
  const result = await getAdminFromRequest(req)
  if (!result) {
    return { ok: false as const }
  }
  return { ok: true as const, data: result }
}

export function isSuperAdmin(role: AdminRole) {
  return isSuperAdminRole(role)
}
