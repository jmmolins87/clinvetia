import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { AdminAudit } from "@/models/AdminAudit"
import { dbConnect } from "@/lib/db"

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await dbConnect()
  const items = await AdminAudit.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  return NextResponse.json({
    audit: items.map((item) => ({
      id: String(item._id),
      adminId: String(item.adminId),
      action: item.action,
      targetType: item.targetType,
      targetId: item.targetId,
      metadata: item.metadata,
      createdAt: item.createdAt.toISOString(),
    })),
  })
}
