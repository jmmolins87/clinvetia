import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { resetDemoMailMessages } from "@/lib/admin-demo-mail-state"

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (auth.data.admin.role !== "demo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  resetDemoMailMessages()
  return NextResponse.json({ ok: true, demo: true })
}

