"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useDynamicPageSize } from "@/lib/use-dynamic-page-size"
import { type AdminRole } from "@/lib/admin-roles"

export default function AdminContactsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [contacts, setContacts] = useState<Array<{
    id: string
    nombre: string
    email: string
    telefono?: string
    clinica: string
    mensaje?: string
    roi?: {
      monthlyPatients?: number
      averageTicket?: number
      conversionLoss?: number
      roi?: number
    }
    booking?: {
      id: string
      date: string
      time: string
      duration: number
      status: string
    } | null
    createdAt: string
  }>>([])
  const [role, setRole] = useState<AdminRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nombre: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const listRef = useRef<HTMLDivElement | null>(null)
  const itemRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const pageSize = useDynamicPageSize({
    listRef,
    itemRef,
    footerRef,
    defaultSize: 6,
    deps: [contacts.length],
  })

  const load = useCallback(async () => {
    try {
      const meRes = await fetch("/api/admin/me", { cache: "no-store" })
      if (meRes.status === 401) {
        router.push("/admin/login")
        return
      }
      const meData = await meRes.json()
      setRole(meData.admin.role)

      const res = await fetch("/api/admin/contacts", { cache: "no-store" })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "Error al cargar contactos")
      }
      const data = await res.json()
      setContacts(data.contacts)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "No se pudieron cargar los contactos",
        description: err instanceof Error ? err.message : "Error al cargar contactos",
      })
    } finally {
      setLoading(false)
    }
  }, [router, toast])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [contacts.length, pageSize])

  const totalPages = Math.max(1, Math.ceil(contacts.length / pageSize))
  const pageSafe = Math.min(page, totalPages)
  const pagedContacts = contacts.slice((pageSafe - 1) * pageSize, pageSafe * pageSize)
  const canDelete = role === "superadmin" || role === "admin"

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "clinvetia:dashboard-refresh") return
      load()
    }
    const onLocalEvent = () => load()
    window.addEventListener("storage", onStorage)
    window.addEventListener("clinvetia:dashboard-refresh", onLocalEvent)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("clinvetia:dashboard-refresh", onLocalEvent)
    }
  }, [load])

  const deleteContact = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/contacts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo eliminar el contacto")
      }
      await load()
      try {
        localStorage.setItem("clinvetia:dashboard-refresh", String(Date.now()))
      } catch {}
      window.dispatchEvent(new Event("clinvetia:dashboard-refresh"))
    } catch (err) {
      toast({
        variant: "destructive",
        title: "No se pudo eliminar el contacto",
        description: err instanceof Error ? err.message : "No se pudo eliminar el contacto",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar contacto</DialogTitle>
            <DialogDescription>
              {deleteTarget ? `Vas a eliminar el contacto de ${deleteTarget.nombre}. Esta acción no se puede deshacer.` : "Confirma la eliminación del contacto."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="w-full sm:flex-1" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:flex-1"
              onClick={async () => {
                const id = deleteTarget?.id
                setDeleteTarget(null)
                if (!id) return
                await deleteContact(id)
              }}
            >
              Eliminar contacto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Contactos</h2>
      </div>

      <GlassCard className="p-6 space-y-5">
        {loading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Spinner size="sm" variant="secondary" />
            <span>Cargando contactos...</span>
          </div>
        )}
        {!loading && contacts.length === 0 && (
          <div className="text-sm text-muted-foreground">Sin contactos</div>
        )}
        {!loading && (
          <div ref={listRef} className="space-y-4 mb-4">
            {pagedContacts.map((contact, index) => (
              <div
                key={contact.id}
                ref={index === 0 ? itemRef : undefined}
                className="rounded-xl border border-white/10 px-4 py-4 space-y-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium">{contact.nombre}</div>
                    <div className="text-xs text-muted-foreground">{contact.clinica}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{new Date(contact.createdAt).toLocaleDateString("es-ES")}</Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="!w-auto px-3"
                      disabled={deletingId === contact.id || !canDelete}
                      onClick={() => setDeleteTarget({ id: contact.id, nombre: contact.nombre })}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 text-xs md:max-w-2xl">
                  <div className="space-y-1">
                    <div className="text-muted-foreground uppercase">Correo</div>
                    <div className="text-foreground break-all">{contact.email}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground uppercase">Teléfono</div>
                    <div className="text-foreground">{contact.telefono || "-"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground uppercase">ROI</div>
                    <div className="text-foreground">{typeof contact.roi?.roi === "number" ? `${contact.roi.roi}%` : "-"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground uppercase">Demo</div>
                    <div className="text-foreground">
                      {contact.booking ? `${contact.booking.time} · ${contact.booking.duration}m` : "Sin demo"}
                    </div>
                  </div>
                </div>

                {contact.booking && (
                  <div className="rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">Demo: </span>
                    <span className="capitalize">{new Date(contact.booking.date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}</span>
                    <span className="text-muted-foreground"> · Estado: </span>
                    <span>{contact.booking.status}</span>
                  </div>
                )}

                {contact.mensaje && (
                  <div className="rounded-lg border border-white/8 bg-white/5 px-3 py-3 text-xs text-muted-foreground whitespace-pre-wrap">
                    {contact.mensaje}
                  </div>
                )}

                {contact.roi && (
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="rounded-lg border border-white/8 bg-white/5 px-3 py-2">
                      <span className="text-muted-foreground">Pacientes/mes: </span>{contact.roi.monthlyPatients ?? "-"}
                    </div>
                    <div className="rounded-lg border border-white/8 bg-white/5 px-3 py-2">
                      <span className="text-muted-foreground">Ticket: </span>{typeof contact.roi.averageTicket === "number" ? `${contact.roi.averageTicket}€` : "-"}
                    </div>
                    <div className="rounded-lg border border-white/8 bg-white/5 px-3 py-2">
                      <span className="text-muted-foreground">Pérdida conv.: </span>{typeof contact.roi.conversionLoss === "number" ? `${contact.roi.conversionLoss}%` : "-"}
                    </div>
                    <div className="rounded-lg border border-white/8 bg-white/5 px-3 py-2">
                      <span className="text-muted-foreground">ROI: </span>{typeof contact.roi.roi === "number" ? `${contact.roi.roi}%` : "-"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {!loading && contacts.length > 0 && (
          <div
            ref={footerRef}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-muted-foreground"
          >
            <span>
              Página {pageSafe} de {totalPages} · {contacts.length} contactos
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
