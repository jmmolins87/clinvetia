"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Activity,
  CalendarClock,
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock3,
  Inbox,
  TimerReset,
  TrendingUp,
  Users,
} from "lucide-react"

import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Spinner } from "@/components/ui/spinner"

type OverviewResponse = {
  mode: "demo" | "superadmin"
  rangeDays: 7 | 30
  kpis: {
    totalBookings: number
    confirmedBookings: number
    pendingBookings: number
    expiredBookings: number
    cancelledBookings: number
  }
  recentBookings: Array<{
    id: string
    date: string
    time: string
    duration: number
    status: string
    email: string
  }>
  recentContacts: Array<{
    id: string
    nombre: string
    email: string
    clinica: string
    createdAt: string
  }>
  charts: {
    labels: string[]
    bookings: number[]
    contacts: number[]
  }
}

function statusBadgeVariant(status: string): "primary" | "warning" | "destructive" | "outline" | "secondary" | "accent" {
  if (status === "confirmed") return "primary"
  if (status === "pending") return "warning"
  if (status === "cancelled") return "secondary"
  if (status === "expired") return "destructive"
  return "accent"
}

function SparkBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)

  return (
    <div className="flex h-20 items-end gap-2">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex flex-1 items-end">
          <div
            className="w-full rounded-md border border-primary/20 bg-gradient-to-t from-primary/20 to-primary/50"
            style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  )
}

function StatusSparkBars({ values }: { values: Array<{ value: number; tone: "primary" | "warning" | "secondary" | "destructive" }> }) {
  const max = Math.max(...values.map((entry) => entry.value), 1)
  const tones = {
    primary: "border-primary/20 from-primary/20 to-primary/50",
    warning: "border-warning/20 from-warning/20 to-warning/50",
    secondary: "border-secondary/20 from-secondary/20 to-secondary/50",
    destructive: "border-destructive/20 from-destructive/20 to-destructive/50",
  } as const

  return (
    <div className="flex h-20 items-end gap-2">
      {values.map((entry, index) => (
        <div key={`${entry.tone}-${index}`} className="flex flex-1 items-end">
          <div
            className={`w-full rounded-md border bg-gradient-to-t ${tones[entry.tone]}`}
            style={{ height: `${Math.max(10, (entry.value / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  )
}

function DonutStatus({
  confirmed,
  pending,
  cancelled,
  expired,
}: {
  confirmed: number
  pending: number
  cancelled: number
  expired: number
}) {
  const total = confirmed + pending + cancelled + expired
  const safeTotal = total || 1
  const rows = [
    { label: "Confirmadas", value: confirmed, pct: Math.round((confirmed / safeTotal) * 100), tone: "primary" },
    { label: "Pendientes", value: pending, pct: Math.round((pending / safeTotal) * 100), tone: "warning" },
    { label: "Canceladas", value: cancelled, pct: Math.round((cancelled / safeTotal) * 100), tone: "secondary" },
    { label: "Expiradas", value: expired, pct: Math.round((expired / safeTotal) * 100), tone: "destructive" },
  ] as const

  const toneClasses = {
    primary: "bg-primary border-primary/30",
    warning: "bg-warning border-warning/30",
    secondary: "bg-secondary border-secondary/30",
    destructive: "bg-destructive border-destructive/30",
  } as const

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Total de citas</span>
          <span className="text-lg font-semibold">{total}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-background/60">
          <div className="flex h-full w-full">
            {rows.map((row) => (
              <div
                key={row.label}
                className={toneClasses[row.tone]}
                style={{ width: `${row.pct}%` }}
                title={`${row.label}: ${row.value}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-sm ${row.tone === "primary" ? "bg-primary" : row.tone === "warning" ? "bg-warning" : row.tone === "secondary" ? "bg-secondary" : "bg-destructive"}`} />
              <span>{row.label}</span>
            </div>
            <span className="text-muted-foreground">{row.pct}%</span>
            <span className="font-semibold">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<OverviewResponse | null>(null)
  const [rangeDays, setRangeDays] = useState<7 | 30>(7)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/overview?range=${rangeDays}`, { cache: "no-store" })
        if (res.status === 401) {
          router.push("/admin/login")
          return
        }
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || "Error al cargar datos")
        }
        setData((await res.json()) as OverviewResponse)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router, rangeDays])

  const kpis = data?.kpis ?? {
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    expiredBookings: 0,
    cancelledBookings: 0,
  }

  const ratio = kpis.totalBookings > 0 ? Math.round((kpis.confirmedBookings / kpis.totalBookings) * 100) : 0
  const workloadBars = [
    { value: kpis.pendingBookings, tone: "warning" as const },
    { value: kpis.confirmedBookings, tone: "primary" as const },
    { value: kpis.cancelledBookings, tone: "secondary" as const },
    { value: kpis.expiredBookings, tone: "destructive" as const },
  ]
  const trendBars = [
    Math.max(1, kpis.pendingBookings),
    Math.max(1, Math.round(kpis.confirmedBookings * 0.6)),
    Math.max(1, Math.round(kpis.confirmedBookings * 0.8)),
    Math.max(1, kpis.confirmedBookings),
    Math.max(1, Math.round((kpis.confirmedBookings + kpis.pendingBookings) * 0.7)),
    Math.max(1, kpis.totalBookings),
  ]
  const chartLabels = data?.charts?.labels ?? []
  const bookingTrend = data?.charts?.bookings ?? []
  const contactTrend = data?.charts?.contacts ?? []
  const chartMax = Math.max(...bookingTrend, ...contactTrend, 1)

  return (
    <div className="space-y-7">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <GlassCard className="relative overflow-hidden p-5 md:p-6">
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={data?.mode === "demo" ? "secondary" : "primary"}>
                    {data?.mode === "demo" ? "Modo demo" : "Producción"}
                  </Badge>
                  <Badge variant="outline">Operaciones</Badge>
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">Dashboard de gestión de citas</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vista operativa para aceptar, cancelar y supervisar reservas y leads.
                </p>
              </div>
              <div className="flex w-full items-center gap-2 md:w-auto md:justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant={rangeDays === 7 ? "default" : "ghost"}
                  className="!w-auto flex-1 md:flex-none"
                  onClick={() => setRangeDays(7)}
                >
                  7d
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={rangeDays === 30 ? "default" : "ghost"}
                  className="!w-auto flex-1 md:flex-none"
                  onClick={() => setRangeDays(30)}
                >
                  30d
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <GlassCard className="border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Total citas</span>
                  <Icon icon={CalendarDays} size="sm" variant="primary" />
                </div>
                <div className="mt-2 text-2xl font-bold">{loading ? "—" : kpis.totalBookings}</div>
                <div className="mt-1 text-xs text-muted-foreground">Base de operaciones</div>
              </GlassCard>

              <GlassCard className="border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Aceptación</span>
                  <Icon icon={TrendingUp} size="sm" variant="accent" />
                </div>
                <div className="mt-2 text-2xl font-bold">{loading ? "—" : `${ratio}%`}</div>
                <div className="mt-1 text-xs text-muted-foreground">Confirmadas / total</div>
              </GlassCard>

              <GlassCard className="border-warning/20 bg-warning/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-warning">Pendientes</span>
                  <Icon icon={Clock3} size="sm" variant="warning" />
                </div>
                <div className="mt-2 text-2xl font-bold text-warning">{loading ? "—" : kpis.pendingBookings}</div>
                <div className="mt-1 text-xs text-muted-foreground">Requieren decisión</div>
              </GlassCard>

              <GlassCard className="border-secondary/20 bg-secondary/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-secondary">Leads recientes</span>
                  <Icon icon={Inbox} size="sm" variant="secondary" />
                </div>
                <div className="mt-2 text-2xl font-bold text-secondary">{loading ? "—" : data?.recentContacts.length ?? 0}</div>
                <div className="mt-1 text-xs text-muted-foreground">Últimos registros</div>
              </GlassCard>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Icon icon={Activity} size="sm" variant="accent" />
              <h3 className="text-base font-semibold">Distribución de estados</h3>
            </div>
            <Badge variant="outline" className="w-fit">En tiempo real</Badge>
          </div>
          <div className="mt-4">
            <DonutStatus
              confirmed={kpis.confirmedBookings}
              pending={kpis.pendingBookings}
              cancelled={kpis.cancelledBookings}
              expired={kpis.expiredBookings}
            />
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Carga operativa</div>
            <StatusSparkBars values={workloadBars} />
          </div>
        </GlassCard>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_1fr]">
        <GlassCard className="p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr] sm:items-center">
            <div className="flex min-w-0 items-center gap-2">
              <Icon icon={CalendarClock} size="default" variant="primary" />
              <h3 className="text-base font-semibold sm:whitespace-nowrap">Reservas recientes</h3>
            </div>
            <div className="flex justify-start sm:justify-end">
              <Button variant="ghost" size="sm" className="w-auto px-3" asChild>
              <Link href="/admin/bookings">Ver todas</Link>
              </Button>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner size="sm" variant="primary" />
                <span>Cargando citas...</span>
              </div>
            )}
            {!loading && (data?.recentBookings.length ?? 0) === 0 && (
              <div className="text-sm text-muted-foreground">Sin reservas</div>
            )}
            {!loading && data?.recentBookings.map((booking) => (
              <div
                key={booking.id}
                className={
                  booking.status === "expired"
                    ? "rounded-xl border border-destructive/20 bg-destructive/5 p-3"
                    : booking.status === "pending"
                      ? "rounded-xl border border-warning/20 bg-warning/5 p-3"
                      : booking.status === "confirmed"
                        ? "rounded-xl border border-primary/20 bg-primary/5 p-3"
                        : booking.status === "cancelled"
                          ? "rounded-xl border border-secondary/20 bg-secondary/5 p-3"
                          : "rounded-xl border border-white/10 bg-white/5 p-3"
                }
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {new Date(booking.date).toLocaleDateString("es-ES")} · {booking.time}
                    </div>
                    <div className="text-xs text-muted-foreground">{booking.duration} min · ID {booking.id.slice(-6)}</div>
                  </div>
                  <Badge variant={statusBadgeVariant(booking.status)}>{booking.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon={Users} size="sm" variant="primary" />
              <h3 className="text-base font-semibold">Actividad comercial</h3>
            </div>
            <Badge variant="accent">Resumen</Badge>
          </div>

          <div className="mt-5 space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Embudo operativo</div>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Leads", value: data?.recentContacts.length ?? 0, icon: Inbox, variant: "secondary" as const },
                  { label: "Pendientes", value: kpis.pendingBookings, icon: Clock3, variant: "warning" as const },
                  { label: "Confirmadas", value: kpis.confirmedBookings, icon: CircleCheck, variant: "primary" as const },
                  { label: "Canceladas", value: kpis.cancelledBookings, icon: CircleX, variant: "secondary" as const },
                  { label: "Expiradas", value: kpis.expiredBookings, icon: TimerReset, variant: "destructive" as const },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Icon icon={row.icon} size="xs" variant={row.variant} />
                      <span className="text-sm">{row.label}</span>
                    </div>
                    <span className="text-sm font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2">
                <Icon icon={TimerReset} size="xs" variant="accent" />
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Tendencia visual</div>
              </div>
              <div className="mt-3">
                {data?.charts ? (
                  <div className="space-y-3">
                    <div
                      className="grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${Math.max(bookingTrend.length, 1)}, minmax(0, 1fr))` }}
                    >
                      {bookingTrend.map((value, index) => (
                        <div key={`b-${index}`} className="flex flex-col items-center gap-1">
                          <div className="flex h-20 w-full items-end">
                            <div
                              className="w-full rounded-sm border border-primary/20 bg-gradient-to-t from-primary/25 to-primary/70"
                              style={{ height: `${Math.max(6, (value / chartMax) * 100)}%` }}
                            />
                          </div>
                          {rangeDays === 7 && chartLabels[index] && (
                            <span className="text-[9px] text-muted-foreground">{chartLabels[index]}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div
                      className="grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${Math.max(contactTrend.length, 1)}, minmax(0, 1fr))` }}
                    >
                      {contactTrend.map((value, index) => (
                        <div key={`c-${index}`} className="flex flex-col items-center gap-1">
                          <div className="flex h-12 w-full items-end">
                            <div
                              className="w-full rounded-sm border border-secondary/20 bg-gradient-to-t from-secondary/25 to-secondary/70"
                              style={{ height: `${Math.max(6, (value / chartMax) * 100)}%` }}
                            />
                          </div>
                          {rangeDays === 30 && index % 5 === 0 && chartLabels[index] && (
                            <span className="text-[9px] text-muted-foreground">{chartLabels[index]}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Citas</div>
                      <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-secondary" />Leads</div>
                      <span>Rango {rangeDays} días</span>
                    </div>
                  </div>
                ) : (
                  <SparkBars values={trendBars} />
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr] sm:items-center">
            <h3 className="min-w-0 text-base font-semibold sm:whitespace-nowrap">Leads recientes</h3>
            <div className="flex justify-start sm:justify-end">
              <Button variant="ghost" size="sm" className="w-auto px-3" asChild>
                <Link href="/admin/contacts">Abrir</Link>
              </Button>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner size="sm" variant="secondary" />
                <span>Cargando leads...</span>
              </div>
            )}
            {!loading && (data?.recentContacts.length ?? 0) === 0 && (
              <div className="text-sm text-muted-foreground">Sin contactos</div>
            )}
            {!loading && data?.recentContacts.map((contact) => (
              <div key={contact.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{contact.nombre}</div>
                    <div className="text-xs text-muted-foreground">{contact.clinica}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{contact.email}</div>
                  </div>
                  <Badge variant="secondary">
                    {new Date(contact.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <GlassCard className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Tabla rápida de operación</h3>
            <Badge variant="outline" className="w-fit">Acción sugerida</Badge>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <div className="min-w-[640px]">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] bg-white/5 px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">
              <div>Bloque</div>
              <div>Volumen</div>
              <div>Estado</div>
              <div>Acción</div>
            </div>
            {[
              {
                label: "Citas pendientes",
                value: kpis.pendingBookings,
                status: "Atención",
                actionLabel: "Revisar",
                href: "/admin/bookings",
                actionVariant: "warning" as const,
              },
              {
                label: "Citas canceladas",
                value: kpis.cancelledBookings,
                status: "Seguimiento",
                actionLabel: "Ver canceladas",
                href: "/admin/bookings",
                actionVariant: "secondary" as const,
              },
              {
                label: "Contactos recientes",
                value: data?.recentContacts.length ?? 0,
                status: "Nuevo",
                actionLabel: "Abrir leads",
                href: "/admin/contacts",
                actionVariant: "accent" as const,
              },
              {
                label: "Citas expiradas",
                value: kpis.expiredBookings,
                status: "Higiene",
                actionLabel: "Ver expiradas",
                href: "/admin/bookings",
                actionVariant: "destructive" as const,
              },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] items-center border-t border-white/10 px-3 py-3 text-sm">
                <div>{row.label}</div>
                <div className="font-semibold">{row.value}</div>
                <div className="text-muted-foreground">{row.status}</div>
                <div className="flex justify-start">
                  <Button
                    variant={row.actionVariant}
                    size="sm"
                    className="h-7 w-auto px-2.5 text-xs"
                    asChild
                  >
                    <Link href={row.href}>{row.actionLabel}</Link>
                  </Button>
                </div>
              </div>
            ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Accesos rápidos</h3>
            <Badge variant="accent" className="w-fit">Gestión</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              { href: "/admin/bookings", title: "Gestionar citas", subtitle: "Aceptar, cancelar y revisar agenda", icon: CalendarDays, variant: "primary" as const },
              { href: "/admin/contacts", title: "Gestionar leads", subtitle: "Seguimiento de formularios", icon: Inbox, variant: "secondary" as const },
              { href: "/admin/audit", title: "Auditoría de acciones", subtitle: "Trazabilidad interna", icon: Activity, variant: "accent" as const },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-primary/30 hover:bg-primary/5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <Icon icon={item.icon} size="sm" variant={item.variant} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium group-hover:text-primary">{item.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.subtitle}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Tabla de estadísticas (citas)</h3>
            <Badge variant="outline" className="w-fit">Estados</Badge>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <div className="min-w-[680px]">
            <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.9fr] bg-white/5 px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">
              <div>Métrica</div>
              <div>Valor</div>
              <div>% total</div>
              <div>Lectura</div>
            </div>
            {[
              { label: "Confirmadas", value: kpis.confirmedBookings, tone: "OK" },
              { label: "Pendientes", value: kpis.pendingBookings, tone: "Atención" },
              { label: "Canceladas", value: kpis.cancelledBookings, tone: "Seguimiento" },
              { label: "Expiradas", value: kpis.expiredBookings, tone: "Higiene" },
            ].map((row) => {
              const pct = kpis.totalBookings > 0 ? Math.round((row.value / kpis.totalBookings) * 100) : 0
              const valueClass =
                row.label === "Confirmadas"
                  ? "text-primary"
                  : row.label === "Pendientes"
                    ? "text-warning"
                    : row.label === "Canceladas"
                      ? "text-secondary"
                      : "text-destructive"
              return (
                <div key={row.label} className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.9fr] items-center border-t border-white/10 px-3 py-3 text-sm">
                  <div>{row.label}</div>
                  <div className={`font-semibold ${valueClass}`}>{row.value}</div>
                  <div className="text-muted-foreground">{pct}%</div>
                  <div className="text-xs text-muted-foreground">{row.tone}</div>
                </div>
              )
            })}
            <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.9fr] items-center border-t border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold">
              <div>Total</div>
              <div>{kpis.totalBookings}</div>
              <div>100%</div>
              <div className="text-primary">Operativo</div>
            </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Tabla de estadísticas (actividad)</h3>
            <Badge variant="accent" className="w-fit">Resumen</Badge>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <div className="min-w-[620px]">
            <div className="grid grid-cols-[1.2fr_0.8fr_1fr] bg-white/5 px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">
              <div>Indicador</div>
              <div>Valor</div>
              <div>Observación</div>
            </div>
            {[
              {
                label: "Leads recientes",
                value: data?.recentContacts.length ?? 0,
                note: "Entradas recientes visibles en panel",
              },
              {
                label: "Reservas recientes",
                value: data?.recentBookings.length ?? 0,
                note: "Últimas citas creadas/actualizadas",
              },
              {
                label: "Ratio confirmación",
                value: `${ratio}%`,
                note: "Confirmadas sobre el total",
              },
              {
                label: "Carga pendiente",
                value: kpis.pendingBookings,
                note: kpis.pendingBookings > 0 ? "Hay citas por revisar" : "Sin cola pendiente",
              },
              {
                label: "Cancelaciones",
                value: kpis.cancelledBookings,
                note: kpis.cancelledBookings > 0 ? "Conviene seguimiento comercial" : "Sin cancelaciones",
              },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-[1.2fr_0.8fr_1fr] items-center border-t border-white/10 px-3 py-3 text-sm">
                <div>{row.label}</div>
                <div
                  className={
                    row.label === "Carga pendiente"
                      ? "font-semibold text-warning"
                      : row.label === "Cancelaciones"
                        ? "font-semibold text-secondary"
                        : row.label === "Ratio confirmación"
                          ? "font-semibold text-primary"
                          : "font-semibold"
                  }
                >
                  {row.value}
                </div>
                <div className="text-xs text-muted-foreground">{row.note}</div>
              </div>
            ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
