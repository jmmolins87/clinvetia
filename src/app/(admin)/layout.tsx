import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/layout/admin-shell"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-image-preview": "none",
      "max-snippet": 0,
      "max-video-preview": 0,
    },
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const cookieName = process.env.ADMIN_COOKIE_NAME || "clinvetia_admin_session"
  const token = cookieStore.get(cookieName)?.value

  if (!token) {
    redirect("/admin/login")
  }

  return <AdminShell>{children}</AdminShell>
}
