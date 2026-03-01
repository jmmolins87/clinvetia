"use client"

import { useCallback, useEffect, useState } from "react"
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
  Mail,
  Send,
  TimerReset,
  TrendingUp,
  Users,
} from "lucide-react"

import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type OverviewResponse = {
  mode: "demo" | "superadmin"
  rangeDays: 7 | 30
  kpis: {
    totalBookings: number
    totalContacts: number
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
    nombre?: string
    telefono?: string
    clinica?: string
    mensaje?: string
    roi?: {
      monthlyPatients?: number
      averageTicket?: number
      conversionLoss?: number
      roi?: number
    } | null
    googleMeetLink?: string | null
    emailEvents?: Array<{
      category: string
      subject: string
      intendedRecipient?: string | null
      deliveredTo: string
      status: "sent" | "failed"
      error?: string | null
      message?: string | null
      sentAt: string
    }>
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

function statusLabel(status: string) {
  if (status === "confirmed") return "Confirmada"
  if (status === "pending") return "Pendiente"
  if (status === "cancelled") return "Cancelada"
  if (status === "expired") return "Expirada"
  return status
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
  const { toast } = useToast()
  const [data, setData] = useState<OverviewResponse | null>(null)
  const [rangeDays, setRangeDays] = useState<7 | 30>(7)
  const [loading, setLoading] = useState(true)
  const [emailTarget, setEmailTarget] = useState<{ nombre: string; email: string } | null>(null)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [emailMailbox, setEmailMailbox] = useState<"shared" | "self">("self")
  const [canUseSharedMailbox, setCanUseSharedMailbox] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  const openEmailDialog = (target: { nombre: string; email: string }) => {
    setEmailTarget(target)
    setEmailMailbox(canUseSharedMailbox ? "shared" : "self")
    setEmailSubject("Seguimiento de tu solicitud en Clinvetia")
    setEmailMessage(`Hola ${target.nombre},\n\nGracias por tu interés. Te escribimos para dar seguimiento a tu solicitud.\n\nQuedamos atentos a tu respuesta.\n\nEquipo Clinvetia`)
  }

  const sendCustomerEmail = async () => {
    if (!emailTarget || !emailSubject.trim() || !emailMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Completa asunto y mensaje",
        description: "Debes indicar destinatario, asunto y contenido antes de enviar.",
      })
      return
    }
    setSendingEmail(true)
    try {
      const res = await fetch("/api/admin/customer-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailbox: emailMailbox,
          to: emailTarget.email,
          customerName: emailTarget.nombre,
          subject: emailSubject.trim(),
          message: emailMessage.trim(),
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo enviar el correo")
      }
      toast({
        variant: "success",
        title: "Correo enviado",
        description: `Se envió la respuesta a ${emailTarget.email} desde ${emailMailbox === "shared" ? "info@clinvetia.com" : "tu correo de usuario"}.`,
      })
      setEmailTarget(null)
      setEmailSubject("")
      setEmailMessage("")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar el correo",
        description: err instanceof Error ? err.message : "Error al enviar correo",
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const load = useCallback(async () => {
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
      toast({
        variant: "destructive",
        title: "No se pudo cargar el dashboard",
        description: err instanceof Error ? err.message : "Error al cargar datos",
      })
    } finally {
      setLoading(false)
    }
  }, [rangeDays, router, toast])

  useEffect(() => {
    let mounted = true
    const loadCapabilities = async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" })
        if (!res.ok) return
        const payload = await res.json()
        const role = String(payload?.admin?.role || "")
        if (!mounted) return
        setCanUseSharedMailbox(role === "superadmin" || role === "admin")
      } catch {}
    }
    loadCapabilities()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "clinvetia:dashboard-refresh") return
      load()
    }
    const onLocalEvent = () => load()
    window.addEventListener("storage", onStorage)
    window.addEventListener("clinvetia:dashboard-refresh", onLocalEvent)
    window.addEventListener("clinvetia:booking-updated", onLocalEvent)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("clinvetia:dashboard-refresh", onLocalEvent)
      window.removeEventListener("clinvetia:booking-updated", onLocalEvent)
    }
  }, [load])

  const kpis = data?.kpis ?? {
    totalBookings: 0,
    totalContacts: 0,
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
      <Dialog
        open={Boolean(emailTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setEmailTarget(null)
            setEmailSubject("")
            setEmailMessage("")
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Responder cliente por correo</DialogTitle>
            <DialogDescription>
              Envío corporativo desde <span className="font-semibold text-primary">info@clinvetia.com</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Para: </span>
              <span className="font-medium">{emailTarget?.nombre || "Cliente"}</span>
              <span className="text-muted-foreground"> · </span>
              <span className="break-all">{emailTarget?.email}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dashboard-email-mailbox">Enviar desde</label>
              {canUseSharedMailbox ? (
                <Select
                  id="dashboard-email-mailbox"
                  value={emailMailbox}
                  onChange={(e) => setEmailMailbox(e.target.value as "shared" | "self")}
                  className="h-10 rounded-xl px-3 pr-10"
                >
                  <option value="shared">info@clinvetia.com</option>
                  <option value="self">Mi correo de usuario</option>
                </Select>
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground">
                  Mi correo de usuario
                </div>
              )}
            </div>
            <Input
              value={emailSubject}
              onChange={(event) => setEmailSubject(event.target.value)}
              placeholder="Asunto del correo"
              className="glass"
            />
            <Textarea
              value={emailMessage}
              onChange={(event) => setEmailMessage(event.target.value)}
              placeholder="Escribe el mensaje para el cliente..."
              className="glass min-h-40"
            />
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:flex-1"
              onClick={() => setEmailTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="default"
              className="w-full sm:flex-1"
              onClick={sendCustomerEmail}
              disabled={sendingEmail}
            >
              <Icon icon={Send} size="xs" variant="primary" />
              {sendingEmail ? "Enviando..." : "Enviar correo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <GlassCard className="relative p-5 md:p-6">
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

            <div className="grid w-full gap-4 sm:grid-cols-2">
              <GlassCard className="border-white/10 p-4 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Total citas</span>
                  <Icon icon={CalendarDays} size="sm" variant="primary" className="text-primary drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.85)]" />
                </div>
                <div className="mt-2 min-h-8 text-2xl font-bold text-primary">
                  {loading ? <Spinner size="default" variant="primary" className="text-primary drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.75)]" /> : kpis.totalBookings}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Base de operaciones</div>
              </GlassCard>

              <GlassCard className="border-white/10 p-4 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Aceptación</span>
                  <Icon icon={TrendingUp} size="sm" variant="success" className="text-success drop-shadow-[0_0_12px_rgba(var(--success-rgb),0.85)]" />
                </div>
                <div className="mt-2 min-h-8 text-2xl font-bold text-success">
                  {loading ? <Spinner size="default" variant="success" className="drop-shadow-[0_0_12px_rgba(var(--success-rgb),0.75)]" /> : `${ratio}%`}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Confirmadas / total</div>
              </GlassCard>

              <GlassCard className="border-warning/20 bg-warning/5 p-4 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-warning">Pendientes</span>
                  <Icon icon={Clock3} size="sm" variant="warning" className="text-warning drop-shadow-[0_0_12px_rgba(var(--warning-rgb),0.85)]" />
                </div>
                <div className="mt-2 min-h-8 text-2xl font-bold text-warning">
                  {loading ? <Spinner size="default" variant="warning" className="text-warning drop-shadow-[0_0_12px_rgba(var(--warning-rgb),0.75)]" /> : kpis.pendingBookings}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Requieren decisión</div>
              </GlassCard>

              <GlassCard className="border-secondary/20 bg-secondary/5 p-4 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-secondary">Leads</span>
                  <Icon icon={Inbox} size="sm" variant="secondary" className="text-secondary drop-shadow-[0_0_12px_rgba(var(--secondary-rgb),0.85)]" />
                </div>
                <div className="mt-2 min-h-8 text-2xl font-bold text-secondary">
                  {loading ? <Spinner size="default" variant="secondary" className="text-secondary drop-shadow-[0_0_12px_rgba(var(--secondary-rgb),0.75)]" /> : kpis.totalContacts}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Total registrados</div>
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
            {!loading && data?.recentBookings.map((booking) => {
              const meetLink = booking.googleMeetLink || `https://meet.google.com/new#booking-${booking.id}`
              return (
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
                  <Badge variant={statusBadgeVariant(booking.status)}>{statusLabel(booking.status)}</Badge>
                </div>

                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wider">Datos del usuario</div>
                    <div className="mt-1">
                      <div>{booking.nombre || "Sin nombre"}</div>
                      <div className="break-all">{booking.email || "Sin email"}</div>
                      <div>{booking.telefono || "Sin teléfono"}{booking.clinica ? ` · ${booking.clinica}` : ""}</div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wider">Resumen de demo</div>
                    <div className="mt-1">
                      <div>
                        {new Date(booking.date).toLocaleDateString("es-ES")} · {booking.time} · {booking.duration} min
                      </div>
                      <a
                        href={meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-primary underline-offset-2 hover:underline"
                      >
                        {meetLink}
                      </a>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wider">Resumen ROI</div>
                    <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                      <span>Pacientes/mes: {booking.roi?.monthlyPatients ?? "-"}</span>
                      <span>Ticket: {booking.roi?.averageTicket ?? "-"}{typeof booking.roi?.averageTicket === "number" ? "€" : ""}</span>
                      <span>Pérdida: {booking.roi?.conversionLoss ?? "-"}{typeof booking.roi?.conversionLoss === "number" ? "%" : ""}</span>
                      <span>ROI: {booking.roi?.roi ?? "-"}{typeof booking.roi?.roi === "number" ? "%" : ""}</span>
                    </div>
                  </div>

                  {booking.mensaje && (
                    <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2 whitespace-pre-wrap">
                      {booking.mensaje}
                    </div>
                  )}

                  {booking.emailEvents && booking.emailEvents.length > 0 && (
                    <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2">
                      <div className="text-[11px] uppercase tracking-wider">Correos enviados</div>
                      <div className="mt-1 space-y-1">
                        {booking.emailEvents
                          .slice()
                          .reverse()
                          .slice(0, 3)
                          .map((event, index) => (
                            <div key={`${booking.id}-mail-${index}`}>
                              <span className={event.status === "sent" ? "text-primary" : "text-destructive"}>
                                {event.status === "sent" ? "Enviado" : "Error"}
                              </span>{" "}
                              · {event.subject} · {new Date(event.sentAt).toLocaleString("es-ES")}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )})}
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
                  { label: "Leads", value: kpis.totalContacts, icon: Inbox, variant: "secondary" as const },
                  { label: "Pendientes", value: kpis.pendingBookings, icon: Clock3, variant: "warning" as const },
                  { label: "Confirmadas", value: kpis.confirmedBookings, icon: CircleCheck, variant: "primary" as const },
                  { label: "Canceladas", value: kpis.cancelledBookings, icon: CircleX, variant: "secondary" as const },
                  { label: "Expiradas", value: kpis.expiredBookings, icon: TimerReset, variant: "destructive" as const },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Icon icon={row.icon} size="sm" variant={row.variant} />
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
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary">
                      {new Date(contact.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                    </Badge>
                    <Button
                      type="button"
                      variant="accent"
                      size="sm"
                      className="!w-auto px-3"
                      onClick={() => openEmailDialog({ nombre: contact.nombre, email: contact.email })}
                    >
                      <Icon icon={Mail} size="xs" variant="default" className="text-current" />
                      Responder
                    </Button>
                  </div>
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
          <div className="mt-4">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bloque</TableHead>
                  <TableHead>Volumen</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
                value: kpis.totalContacts,
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
                  <TableRow key={row.label}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell className="font-semibold">{row.value}</TableCell>
                    <TableCell className="text-muted-foreground">{row.status}</TableCell>
                    <TableCell>
                      <Button
                        variant={row.actionVariant}
                        size="sm"
                        className="min-h-9 w-auto px-3 text-sm"
                        asChild
                      >
                        <Link href={row.href}>{row.actionLabel}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
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
                    <Icon
                      icon={item.icon}
                      size="default"
                      variant={item.href === "/admin/audit" ? "success" : item.variant}
                      className={item.href === "/admin/audit" ? "text-success drop-shadow-[0_0_12px_rgba(var(--success-rgb),0.8)]" : undefined}
                    />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={
                        item.href === "/admin/bookings"
                          ? "text-sm font-medium text-primary"
                          : item.href === "/admin/contacts"
                            ? "text-sm font-medium text-secondary"
                            : "text-sm font-medium text-success"
                      }
                    >
                      {item.title}
                    </div>
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
          <div className="mt-4">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Métrica</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>% total</TableHead>
                  <TableHead>Lectura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell className={`font-semibold ${valueClass}`}>{row.value}</TableCell>
                  <TableCell className="text-muted-foreground">{pct}%</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.tone}</TableCell>
                </TableRow>
              )
            })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="font-semibold">{kpis.totalBookings}</TableCell>
                  <TableCell className="font-semibold">100%</TableCell>
                  <TableCell className="font-semibold text-primary">Operativo</TableCell>
                </TableRow>
              </TableFooter>
              </Table>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Tabla de estadísticas (actividad)</h3>
            <Badge variant="accent" className="w-fit">Resumen</Badge>
          </div>
          <div className="mt-4">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicador</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Observación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
              {
                label: "Leads totales",
                value: kpis.totalContacts,
                note: "Total de leads registrados en el sistema",
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
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell
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
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.note}</TableCell>
                </TableRow>
            ))}
              </TableBody>
              </Table>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
