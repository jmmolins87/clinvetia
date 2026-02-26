"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

type AuditItem = {
  id: string
  adminId: string
  action: string
  targetType: string
  targetId: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export default function AdminAuditPage() {
  const router = useRouter()
  const [items, setItems] = useState<AuditItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch("/api/admin/me", { cache: "no-store" })
        if (meRes.status === 401) {
          router.push("/admin/login")
          return
        }

        const res = await fetch("/api/admin/audit", { cache: "no-store" })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || "Error al cargar auditoria")
        }
        const data = await res.json()
        setItems(data.audit || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar auditoria")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Auditoria</h2>
        <Badge variant="accent">Admin</Badge>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <GlassCard className="p-5 space-y-3">
        {loading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Spinner size="sm" variant="accent" />
            <span>Cargando auditoría...</span>
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-sm text-muted-foreground">Sin eventos</div>
        )}
        {!loading && items.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-white/10 px-3 py-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-medium">{item.action}</div>
              <div className="break-all text-xs text-muted-foreground">{item.targetType} · {item.targetId}</div>
              <div className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleString("es-ES")}</div>
            </div>
            <Badge variant="outline">{item.adminId.slice(0, 6)}</Badge>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}
