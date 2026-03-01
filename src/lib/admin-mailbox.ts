import { type AdminRole } from "@/lib/admin-roles"

export const SHARED_MAILBOX_DEFAULT = "info@clinvetia.com"

export function getSharedMailboxEmail() {
  return (process.env.ADMIN_SHARED_MAILBOX || SHARED_MAILBOX_DEFAULT).trim().toLowerCase()
}

export function canUseSharedMailbox(role: AdminRole) {
  return role === "superadmin" || role === "admin"
}

