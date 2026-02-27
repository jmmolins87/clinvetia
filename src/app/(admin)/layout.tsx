import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/layout/admin-shell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const cookieName = process.env.ADMIN_COOKIE_NAME || "clinvetia_admin_session"
  const token = cookieStore.get(cookieName)?.value

  if (!token) {
    redirect("/admin/login")
  }

  return <AdminShell>{children}</AdminShell>
}
