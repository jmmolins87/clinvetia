"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

export default function AdminContactsPage() {
  const router = useRouter()
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch("/api/admin/me", { cache: "no-store" })
        if (meRes.status === 401) {
          router.push("/admin/login")
          return
        }
        await meRes.json()

        const res = await fetch("/api/admin/contacts", { cache: "no-store" })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || "Error al cargar contactos")
        }
        const data = await res.json()
        setContacts(data.contacts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar contactos")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Contactos</h2>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

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
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-xl border border-white/10 px-4 py-4 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium">{contact.nombre}</div>
                    <div className="text-xs text-muted-foreground">{contact.clinica}</div>
                  </div>
                  <Badge variant="secondary">{new Date(contact.createdAt).toLocaleDateString("es-ES")}</Badge>
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
                  <div className="grid grid-cols-2 gap-3 text-xs">
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
      </GlassCard>
    </div>
  )
}
