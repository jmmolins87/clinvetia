import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/admin-auth"

export async function GET(req: Request) {
  const result = await getAdminFromRequest(req)
  if (!result) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    admin: result.admin,
    session: {
      expiresAt: result.session.expiresAt,
      role: result.session.role,
    },
  })
}
