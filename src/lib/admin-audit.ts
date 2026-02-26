import { AdminAudit } from "@/models/AdminAudit"
import { dbConnect } from "@/lib/db"

export async function recordAdminAudit(params: {
  adminId: string
  action: string
  targetType: string
  targetId: string
  metadata?: Record<string, unknown>
}) {
  await dbConnect()
  await AdminAudit.create({
    adminId: params.adminId,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    metadata: params.metadata ?? {},
  })
}
