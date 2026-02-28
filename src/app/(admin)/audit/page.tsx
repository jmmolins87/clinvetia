"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useDynamicPageSize } from "@/lib/use-dynamic-page-size"
import { ContentScroll } from "@/components/ui/content-scroll"

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
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<"pagination" | "scroll">("pagination")
  const listRef = useRef<HTMLDivElement | null>(null)
  const itemRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const pageSize = useDynamicPageSize({
    listRef,
    itemRef,
    footerRef,
    defaultSize: 7,
    deps: [items.length],
  })

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

  useEffect(() => {
    setPage(1)
  }, [items.length, pageSize])

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const pageSafe = Math.min(page, totalPages)
  const pagedItems = items.slice((pageSafe - 1) * pageSize, pageSafe * pageSize)
  const visibleItems = viewMode === "scroll" ? items : pagedItems

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Auditoria</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="!w-auto"
            onClick={() => setViewMode((prev) => (prev === "scroll" ? "pagination" : "scroll"))}
          >
            {viewMode === "scroll" ? "Ver por páginas" : "Ver en lista"}
          </Button>
          <Badge variant="accent">Admin</Badge>
        </div>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <GlassCard className="flex min-h-0 flex-col p-5 space-y-3 pb-8">
        {loading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Spinner size="sm" variant="accent" />
            <span>Cargando auditoría...</span>
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-sm text-muted-foreground">Sin eventos</div>
        )}
        {!loading && (
          viewMode === "scroll" ? (
            <ContentScroll className="flex-1 min-h-0">
              <div className="space-y-3">
                {visibleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-lg border border-white/10 px-3 py-2 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium">{item.action}</div>
                      <div className="break-all text-xs text-muted-foreground">{item.targetType} · {item.targetId}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleString("es-ES")}</div>
                    </div>
                    <Badge variant="outline">{item.adminId.slice(0, 6)}</Badge>
                  </div>
                ))}
              </div>
            </ContentScroll>
          ) : (
            <div ref={listRef} className="space-y-3">
              {visibleItems.map((item, index) => (
                <div
                  key={item.id}
                  ref={index === 0 ? itemRef : undefined}
                  className="flex flex-col gap-2 rounded-lg border border-white/10 px-3 py-2 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="text-sm font-medium">{item.action}</div>
                    <div className="break-all text-xs text-muted-foreground">{item.targetType} · {item.targetId}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleString("es-ES")}</div>
                  </div>
                  <Badge variant="outline">{item.adminId.slice(0, 6)}</Badge>
                </div>
              ))}
            </div>
          )
        )}
        {!loading && items.length > 0 && viewMode === "pagination" && (
          <div
            ref={footerRef}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 mt-4 text-xs text-muted-foreground"
          >
            <span>
              Página {pageSafe} de {totalPages} · {items.length} eventos
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="!w-auto"
                disabled={pageSafe <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="!w-auto"
                disabled={pageSafe >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
