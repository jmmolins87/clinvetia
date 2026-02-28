export const ADMIN_ROLES = ["superadmin", "admin", "manager", "worker", "demo"] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]

const roleRank: Record<AdminRole, number> = {
  superadmin: 5,
  admin: 4,
  manager: 3,
  worker: 2,
  demo: 1,
}

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && (ADMIN_ROLES as readonly string[]).includes(value)
}

export function isSuperAdmin(role: AdminRole) {
  return role === "superadmin"
}

export function canManageRole(actorRole: AdminRole, targetRole: AdminRole) {
  if (isSuperAdmin(actorRole)) return true
  if (targetRole === "superadmin" || targetRole === "demo") return false
  return roleRank[actorRole] >= roleRank[targetRole]
}

export function allowedCreatableRoles(actorRole: AdminRole): AdminRole[] {
  if (actorRole === "worker" || actorRole === "demo") return []
  if (isSuperAdmin(actorRole)) return ADMIN_ROLES.filter((role) => role !== "demo")
  return ADMIN_ROLES.filter((role) => role !== "superadmin" && role !== "demo" && canManageRole(actorRole, role))
}

export function roleBadgeVariant(role: AdminRole): "primary" | "secondary" | "accent" | "warning" | "outline" {
  if (role === "superadmin") return "primary"
  if (role === "admin") return "accent"
  if (role === "manager") return "secondary"
  if (role === "worker") return "warning"
  return "outline"
}
