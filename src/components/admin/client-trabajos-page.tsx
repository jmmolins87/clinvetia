"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FileText,
  FolderOpen,
  Mail,
  Phone,
  Receipt,
  User,
  Wrench,
} from "lucide-react"

import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import type { ContactWorkspacePayload } from "@/lib/contact-workspace"

function EmptyPanel({
  title,
  description,
  icon,
  variant,
}: {
  title: string
  description: string
  icon: typeof FileText
  variant: "primary" | "secondary" | "accent"
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-background/60">
        <Icon icon={icon} size="default" variant={variant} />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function RecordsGrid({
  items,
  tone,
}: {
  items: ContactWorkspacePayload["presupuestos"] | ContactWorkspacePayload["trabajos"] | ContactWorkspacePayload["facturas"]
  tone: "primary" | "secondary" | "accent"
}) {
  const toneClass =
    tone === "primary"
      ? "border-primary/20 bg-primary/5"
      : tone === "secondary"
        ? "border-secondary/20 bg-secondary/5"
        : "border-accent/20 bg-accent/5"

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <div key={item.id} className={`rounded-2xl border p-4 ${toneClass}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
            </div>
            <Badge variant={tone}>{item.status}</Badge>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-muted-foreground">
            <span>
              {new Date(item.date).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
            {typeof item.amount === "number" ? <span className="text-sm font-semibold text-foreground">{item.amount}€</span> : null}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ClientTrabajosPage({ contactId }: { contactId: string }) {
  const { toast } = useToast()
  const [data, setData] = useState<ContactWorkspacePayload | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/contacts/${encodeURIComponent(contactId)}`, { cache: "no-store" })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo cargar la ficha del cliente")
      }
      setData((await res.json()) as ContactWorkspacePayload)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "No se pudo abrir Trabajos",
        description: err instanceof Error ? err.message : "Error al cargar la ficha del cliente",
      })
    } finally {
      setLoading(false)
    }
  }, [contactId, toast])

  useEffect(() => {
    load()
  }, [load])

  const headerBadges = useMemo(
    () => [
      { label: `${data?.metrics.presupuestos ?? 0} presupuestos`, variant: "secondary" as const },
      { label: `${data?.metrics.trabajos ?? 0} trabajos`, variant: "primary" as const },
      { label: `${data?.metrics.facturas ?? 0} facturas`, variant: "accent" as const },
    ],
    [data]
  )

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Spinner size="sm" variant="primary" />
          Cargando ficha del cliente...
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="w-auto px-3" asChild>
          <Link href="/admin/contacts">
            <Icon icon={ArrowLeft} size="xs" variant="default" />
            Volver a contactos
          </Link>
        </Button>
        <GlassCard className="p-6">
          <h1 className="text-xl font-semibold">Cliente no disponible</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No se ha podido recuperar la ficha de trabajo para este cliente.
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" className="w-auto px-3" asChild>
            <Link href="/admin/contacts">
              <Icon icon={ArrowLeft} size="xs" variant="default" />
              Volver a contactos
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {headerBadges.map((badge) => (
              <Badge key={badge.label} variant={badge.variant}>
                {badge.label}
              </Badge>
            ))}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Trabajos de {data.contact.nombre}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Centro operativo del cliente para presupuestos, trabajos, facturas y contexto comercial.
            </p>
          </div>
        </div>

        <GlassCard className="w-full max-w-xl p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-background/55 px-3 py-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Icon icon={Building2} size="xs" variant="accent" />
                Clínica
              </div>
              <div className="mt-2 text-sm font-medium">{data.contact.clinica}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-background/55 px-3 py-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Icon icon={CalendarDays} size="xs" variant="primary" />
                Alta
              </div>
              <div className="mt-2 text-sm font-medium">
                {new Date(data.contact.createdAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-background/55 px-3 py-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Icon icon={Mail} size="xs" variant="secondary" />
                Email
              </div>
              <div className="mt-2 break-all text-sm font-medium">{data.contact.email}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-background/55 px-3 py-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Icon icon={Phone} size="xs" variant="accent" />
                Teléfono
              </div>
              <div className="mt-2 text-sm font-medium">{data.contact.telefono || "Sin teléfono"}</div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Resumen operativo</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Vista rápida de lo que ya existe alrededor del cliente.
              </p>
            </div>
            {data.contact.booking && <Badge variant="primary">{data.contact.booking.status}</Badge>}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Presupuestos", value: data.metrics.presupuestos, icon: FileText, variant: "secondary" as const },
              { label: "Trabajos", value: data.metrics.trabajos, icon: Wrench, variant: "primary" as const },
              { label: "Facturas", value: data.metrics.facturas, icon: Receipt, variant: "accent" as const },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</span>
                  <Icon icon={item.icon} size="sm" variant={item.variant} />
                </div>
                <div className="mt-3 text-3xl font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-2">
            <Icon icon={User} size="sm" variant="secondary" />
            <h2 className="text-base font-semibold">Contexto comercial</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Mensaje del lead</div>
              <div className="mt-2 whitespace-pre-wrap text-foreground">
                {data.contact.mensaje || "Sin mensaje inicial registrado."}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">ROI estimado</div>
                <div className="mt-2 text-lg font-semibold">
                  {typeof data.contact.roi?.roi === "number" ? `${data.contact.roi.roi}%` : "Pendiente"}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Ticket medio</div>
                <div className="mt-2 text-lg font-semibold">
                  {typeof data.contact.roi?.averageTicket === "number" ? `${data.contact.roi.averageTicket}€` : "Pendiente"}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <Tabs defaultValue="presupuestos" className="w-full">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold">Módulos del cliente</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cada bloque concentra la operativa relacionada con esta cuenta.
              </p>
            </div>
            <TabsList className="h-auto w-full justify-start rounded-2xl p-1 lg:w-auto">
              <TabsTrigger value="presupuestos">Presupuestos</TabsTrigger>
              <TabsTrigger value="trabajos">Trabajos</TabsTrigger>
              <TabsTrigger value="facturas">Facturas</TabsTrigger>
              <TabsTrigger value="actividad">Actividad</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="presupuestos">
            {data.presupuestos.length === 0 ? (
              <EmptyPanel
                title="Sin presupuestos todavía"
                description="Esta ficha ya está preparada para centralizar presupuestos del cliente cuando se conecte ese módulo."
                icon={FileText}
                variant="secondary"
              />
            ) : (
              <RecordsGrid items={data.presupuestos} tone="secondary" />
            )}
          </TabsContent>

          <TabsContent value="trabajos">
            {data.trabajos.length === 0 ? (
              <EmptyPanel
                title="Sin trabajos registrados"
                description="Aquí aparecerán órdenes, tareas o intervenciones vinculadas a este cliente."
                icon={FolderOpen}
                variant="primary"
              />
            ) : (
              <RecordsGrid items={data.trabajos} tone="primary" />
            )}
          </TabsContent>

          <TabsContent value="facturas">
            {data.facturas.length === 0 ? (
              <EmptyPanel
                title="Sin facturas emitidas"
                description="Cuando se añada facturación, esta pestaña reunirá todos los documentos económicos del cliente."
                icon={Receipt}
                variant="accent"
              />
            ) : (
              <RecordsGrid items={data.facturas} tone="accent" />
            )}
          </TabsContent>

          <TabsContent value="actividad">
            <div className="grid gap-3">
              {data.actividad.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.tone}>{item.label}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-foreground">{item.detail}</p>
                    </div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </GlassCard>
    </div>
  )
}
