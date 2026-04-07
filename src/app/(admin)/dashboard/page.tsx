"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Activity,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock3,
  Inbox,
  Mail,
  MessageCircle,
  FolderOpen,
  Search,
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
import { formatBookingDate } from "@/lib/booking-date"
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
    rescheduledFromBookingId?: string | null
    rescheduledToBookingId?: string | null
    email: string
    nombre?: string
    telefono?: string
    clinica?: string
    mensaje?: string
    conversationSummary?: string
    conversationMessages?: Array<{
      role: "assistant" | "user"
      content: string
      timestamp: string
    }>
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

type RecentBooking = OverviewResponse["recentBookings"][number]

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
  if (status === "rescheduled") return "Reagendada"
  return status
}

function rescheduleTrace(booking: RecentBooking) {
  if (booking.rescheduledFromBookingId) {
    return `Reagendada desde la cita ${booking.rescheduledFromBookingId}`
  }
  if (booking.rescheduledToBookingId) {
    return `Reagendada como la cita ${booking.rescheduledToBookingId}`
  }
  return null
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

function StatusSparkBars({
  values,
}: {
  values: Array<{ label: string; value: number; tone: "primary" | "warning" | "secondary" | "destructive" }>
}) {
  const max = Math.max(...values.map((entry) => entry.value), 1)
  const tones = {
    primary: "border-primary/20 from-primary/20 to-primary/50",
    warning: "border-warning/20 from-warning/20 to-warning/50",
    secondary: "border-secondary/20 from-secondary/20 to-secondary/50",
    destructive: "border-destructive/20 from-destructive/20 to-destructive/50",
  } as const

  return (
    <div className="grid grid-cols-4 gap-2">
      {values.map((entry, index) => (
        <div key={`${entry.tone}-${index}`} className="rounded-lg border border-white/10 bg-background/35 px-2 py-2">
          <div className="text-center text-xs font-semibold">{entry.value}</div>
          <div className="mt-1 flex h-20 items-end">
            <div
              className={`w-full rounded-md border bg-gradient-to-t ${tones[entry.tone]}`}
              style={{ height: `${Math.max(10, (entry.value / max) * 100)}%` }}
            />
          </div>
          <div className="mt-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">{entry.label}</div>
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
        <div className="h-4 overflow-hidden rounded-full border border-white/10 bg-background/60">
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

function TableOverflowHint({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [showRightHint, setShowRightHint] = useState(false)

  const resolveScrollElement = useCallback(() => {
    return containerRef.current?.querySelector("[data-table-scroll]") as HTMLDivElement | null
  }, [])

  const updateHint = useCallback(() => {
    const el = resolveScrollElement()
    if (!el) return
    const remaining = el.scrollWidth - el.clientWidth - el.scrollLeft
    setShowRightHint(remaining > 2)
  }, [resolveScrollElement])

  useEffect(() => {
    const el = resolveScrollElement()
    updateHint()
    if (el) {
      el.addEventListener("scroll", updateHint, { passive: true })
    }
    window.addEventListener("resize", updateHint)
    return () => {
      if (el) {
        el.removeEventListener("scroll", updateHint)
      }
      window.removeEventListener("resize", updateHint)
    }
  }, [resolveScrollElement, updateHint])

  return (
    <div ref={containerRef} className="relative mt-4 w-full overflow-hidden rounded-xl">
        {children}
      {showRightHint && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-xl bg-gradient-to-l from-primary/25 via-primary/10 to-transparent sm:hidden" />
        </>
      )}
    </div>
  )
}

function RecentBookingCard({
  booking,
  onOpenConversation,
}: {
  booking: RecentBooking
  onOpenConversation: (booking: RecentBooking) => void
}) {
  const meetLink = booking.googleMeetLink || `https://meet.google.com/new#booking-${booking.id}`
  const hasConversation = Boolean(booking.conversationMessages && booking.conversationMessages.length > 0)

  return (
    <div
      className={
        booking.status === "expired"
          ? "w-full min-w-0 overflow-hidden rounded-xl border border-destructive/20 bg-destructive/5 p-2 sm:p-3"
          : booking.status === "pending"
            ? "w-full min-w-0 overflow-hidden rounded-xl border border-warning/20 bg-warning/5 p-2 sm:p-3"
            : booking.status === "confirmed"
              ? "w-full min-w-0 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-2 sm:p-3"
              : booking.status === "cancelled"
                ? "w-full min-w-0 overflow-hidden rounded-xl border border-secondary/20 bg-secondary/5 p-2 sm:p-3"
                : "w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2 sm:p-3"
      }
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="break-words text-sm font-medium">
            {formatBookingDate(booking.date, "es-ES")} · {booking.time}
          </div>
          <div className="break-all text-xs text-muted-foreground">{booking.duration} min · ID {booking.id.slice(-6)}</div>
          {rescheduleTrace(booking) ? (
            <div className="mt-1 text-xs text-accent">{rescheduleTrace(booking)}</div>
          ) : null}
        </div>
        <Badge className="self-start" variant={statusBadgeVariant(booking.status)}>{statusLabel(booking.status)}</Badge>
      </div>

      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
        <div className="min-w-0 rounded-lg border border-white/10 bg-background/40 px-2 py-2 sm:px-3">
          <div className="text-[11px] uppercase tracking-wider">Datos del usuario</div>
          <div className="mt-1 min-w-0 break-words">
            <div>{booking.nombre || "Sin nombre"}</div>
            <div className="break-all">{booking.email || "Sin email"}</div>
            <div className="break-words">{booking.telefono || "Sin teléfono"}{booking.clinica ? ` · ${booking.clinica}` : ""}</div>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-white/10 bg-background/40 px-2 py-2 sm:px-3">
          <div className="text-[11px] uppercase tracking-wider">Resumen de demo</div>
          <div className="mt-1">
            <div className="break-words">
              {formatBookingDate(booking.date, "es-ES")} · {booking.time} · {booking.duration} min
            </div>
            <a
              href={meetLink}
              target="_blank"
              rel="noreferrer"
              className="inline-block max-w-full break-all text-primary underline-offset-2 hover:underline"
            >
              {meetLink}
            </a>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-white/10 bg-background/40 px-2 py-2 sm:px-3">
          <div className="text-[11px] uppercase tracking-wider">Resumen ROI</div>
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
            <span>Pacientes/mes: {booking.roi?.monthlyPatients ?? "-"}</span>
            <span>Ticket: {booking.roi?.averageTicket ?? "-"}{typeof booking.roi?.averageTicket === "number" ? "€" : ""}</span>
            <span>Pérdida: {booking.roi?.conversionLoss ?? "-"}{typeof booking.roi?.conversionLoss === "number" ? "%" : ""}</span>
            <span>ROI: {booking.roi?.roi ?? "-"}{typeof booking.roi?.roi === "number" ? "%" : ""}</span>
          </div>
        </div>

        {booking.mensaje && (
          <div className="min-w-0 whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-background/40 px-2 py-2 sm:px-3">
            {booking.mensaje}
          </div>
        )}

        <div className="min-w-0 rounded-lg border border-white/10 bg-background/40 px-2 py-2 sm:px-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2"
            disabled={!hasConversation}
            onClick={() => onOpenConversation(booking)}
          >
            <Icon icon={MessageCircle} size="xs" variant="primary" />
            {hasConversation ? "Conversación con Moka" : "No hay conversación con Moka"}
          </Button>
        </div>

        {booking.emailEvents && booking.emailEvents.length > 0 && (
          <div className="min-w-0 rounded-lg border border-white/10 bg-background/40 px-2 py-2 sm:px-3">
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
  const [bookingSearchInput, setBookingSearchInput] = useState("")
  const [appliedBookingSearch, setAppliedBookingSearch] = useState("")
  const [bookingSearchPending, setBookingSearchPending] = useState(false)
  const [desktopBookingIndex, setDesktopBookingIndex] = useState(0)
  const [desktopBookingTransitioning, setDesktopBookingTransitioning] = useState(false)
  const [conversationBooking, setConversationBooking] = useState<RecentBooking | null>(null)
  const desktopSwitchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bookingSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
        setCanUseSharedMailbox(role === "superadmin" || role === "admin" || role === "demo")
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
  const recentBookings = useMemo(() => data?.recentBookings ?? [], [data])
  const normalizedBookingSearch = appliedBookingSearch.trim().toLowerCase()
  const filteredRecentBookings = useMemo(() => {
    if (!normalizedBookingSearch) return recentBookings
    return recentBookings.filter((booking) => {
      const searchable = [
        booking.id,
        booking.nombre ?? "",
        booking.email ?? "",
        booking.telefono ?? "",
        booking.clinica ?? "",
        statusLabel(booking.status),
        booking.time,
      ]
      return searchable.join(" ").toLowerCase().includes(normalizedBookingSearch)
    })
  }, [normalizedBookingSearch, recentBookings])
  const totalRecentBookings = filteredRecentBookings.length

  useEffect(() => {
    if (totalRecentBookings === 0) {
      setDesktopBookingIndex(0)
      setDesktopBookingTransitioning(false)
      return
    }
    setDesktopBookingIndex((current) => Math.min(current, totalRecentBookings - 1))
  }, [totalRecentBookings])

  useEffect(() => {
    return () => {
      if (desktopSwitchTimeoutRef.current) {
        clearTimeout(desktopSwitchTimeoutRef.current)
        desktopSwitchTimeoutRef.current = null
      }
      if (bookingSearchTimeoutRef.current) {
        clearTimeout(bookingSearchTimeoutRef.current)
        bookingSearchTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (bookingSearchTimeoutRef.current) {
      clearTimeout(bookingSearchTimeoutRef.current)
    }
    setBookingSearchPending(true)
    bookingSearchTimeoutRef.current = setTimeout(() => {
      setAppliedBookingSearch(bookingSearchInput)
      setDesktopBookingIndex(0)
      setDesktopBookingTransitioning(false)
      setBookingSearchPending(false)
      bookingSearchTimeoutRef.current = null
    }, 500)
  }, [bookingSearchInput])

  const changeDesktopBooking = useCallback((nextIndex: number) => {
    if (totalRecentBookings <= 1 || desktopBookingTransitioning) return
    if (desktopSwitchTimeoutRef.current) {
      clearTimeout(desktopSwitchTimeoutRef.current)
    }
    setDesktopBookingTransitioning(true)
    desktopSwitchTimeoutRef.current = setTimeout(() => {
      setDesktopBookingIndex(nextIndex)
      setDesktopBookingTransitioning(false)
      desktopSwitchTimeoutRef.current = null
    }, 1000)
  }, [desktopBookingTransitioning, totalRecentBookings])

  const rawWorkloadBars = [
    { label: "Pend.", value: kpis.pendingBookings, tone: "warning" as const },
    { label: "Conf.", value: kpis.confirmedBookings, tone: "primary" as const },
    { label: "Canc.", value: kpis.cancelledBookings, tone: "secondary" as const },
    { label: "Exp.", value: kpis.expiredBookings, tone: "destructive" as const },
  ]
  const simulatedDemoWorkload = [4, 7, 2, 1]
  const workloadBars = data?.mode === "demo"
    ? rawWorkloadBars.map((entry, index) => ({ ...entry, value: Math.max(entry.value, simulatedDemoWorkload[index]) }))
    : rawWorkloadBars
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
    <div className="w-full min-w-0 space-y-7 overflow-x-hidden">
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

      <Dialog open={Boolean(conversationBooking)} onOpenChange={(open) => !open && setConversationBooking(null)}>
        <DialogContent className="h-[85vh] max-h-[85vh] overflow-hidden sm:max-w-2xl [&>button]:z-30">
          <DialogHeader>
            <DialogTitle>Conversación con Moka</DialogTitle>
            <DialogDescription>
              {conversationBooking
                ? `${formatBookingDate(conversationBooking.date, "es-ES")} · ${conversationBooking.time} · ${conversationBooking.nombre || conversationBooking.email || conversationBooking.id}`
                : "Detalle de la conversación asociada a la reserva."}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {conversationBooking ? (
              <div className="space-y-3">
                {conversationBooking.conversationSummary ? (
                  <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-background/45 px-3 py-3 text-sm text-muted-foreground">
                    {conversationBooking.conversationSummary}
                  </div>
                ) : null}
                {conversationBooking.conversationMessages && conversationBooking.conversationMessages.length > 0 ? (
                  conversationBooking.conversationMessages.map((message, index) => (
                    <div
                      key={`${conversationBooking.id}-conversation-modal-${index}`}
                      className="rounded-xl border border-white/10 bg-background/45 px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>{message.role === "assistant" ? "Moka" : "Usuario"}</span>
                        <span>{new Date(message.timestamp).toLocaleString("es-ES")}</span>
                      </div>
                      <div className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground/85">{message.content}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-background/45 px-3 py-3 text-sm text-muted-foreground">
                    No ha habido conversación con Moka en esta reserva.
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConversationBooking(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
        <GlassCard className="relative w-full min-w-0 p-5 md:p-6">
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
              <GlassCard className="border-white/10 bg-background/70 backdrop-blur-none shadow-none p-4 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Total citas</span>
                  <Icon icon={CalendarDays} size="sm" variant="primary" className="text-primary drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.85)]" />
                </div>
                <div className="mt-2 min-h-8 text-2xl font-bold text-primary">
                  {loading ? <Spinner size="default" variant="primary" className="text-primary drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.75)]" /> : kpis.totalBookings}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Base de operaciones</div>
              </GlassCard>

              <GlassCard className="border-white/10 bg-background/70 backdrop-blur-none shadow-none p-4 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Aceptación</span>
                  <Icon icon={TrendingUp} size="sm" variant="success" className="text-success drop-shadow-[0_0_12px_rgba(var(--success-rgb),0.85)]" />
                </div>
                <div className="mt-2 min-h-8 text-2xl font-bold text-success">
                  {loading ? <Spinner size="default" variant="success" className="drop-shadow-[0_0_12px_rgba(var(--success-rgb),0.75)]" /> : `${ratio}%`}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Confirmadas / total</div>
              </GlassCard>

              <GlassCard className="border-warning/20 bg-warning/5 backdrop-blur-none shadow-none p-4 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-warning">Pendientes</span>
                  <Icon icon={Clock3} size="sm" variant="warning" className="text-warning drop-shadow-[0_0_12px_rgba(var(--warning-rgb),0.85)]" />
                </div>
                <div className="mt-2 min-h-8 text-2xl font-bold text-warning">
                  {loading ? <Spinner size="default" variant="warning" className="text-warning drop-shadow-[0_0_12px_rgba(var(--warning-rgb),0.75)]" /> : kpis.pendingBookings}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Requieren decisión</div>
              </GlassCard>

              <GlassCard className="border-secondary/20 bg-secondary/5 backdrop-blur-none shadow-none p-4 min-w-0">
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

        <GlassCard className="w-full min-w-0 p-5 md:p-6 lg:min-h-[560px]">
          <div className="flex h-full flex-col">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Icon icon={Activity} size="sm" variant="accent" />
                <h3 className="text-base font-semibold">Distribución de estados</h3>
              </div>
              <Badge variant="outline" className="w-fit">En tiempo real</Badge>
            </div>
            <div className="mt-4 flex-1">
              <DonutStatus
                confirmed={kpis.confirmedBookings}
                pending={kpis.pendingBookings}
                cancelled={kpis.cancelledBookings}
                expired={kpis.expiredBookings}
              />
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Carga operativa</div>
              <div className="mb-2 text-[11px] text-muted-foreground">
                Volumen por estado para priorizar seguimiento diario.
              </div>
              <StatusSparkBars values={workloadBars} />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
        <GlassCard className="flex h-full min-w-0 flex-col overflow-hidden p-5">
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
            <div className="grid min-w-0 gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="relative min-w-0">
                <Icon icon={Search} size="xs" variant="muted" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={bookingSearchInput}
                  onChange={(event) => setBookingSearchInput(event.target.value)}
                  placeholder="Buscar por nombre, email, clínica, teléfono o ID"
                  className="h-10 w-full min-w-0 pl-9"
                  aria-label="Buscar reserva reciente"
                />
              </div>
              <div className="text-xs text-muted-foreground sm:text-right">
                {totalRecentBookings} resultado{totalRecentBookings === 1 ? "" : "s"}
              </div>
            </div>
            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner size="sm" variant="primary" />
                <span>Cargando citas...</span>
              </div>
            )}
            {!loading && !bookingSearchPending && totalRecentBookings === 0 && (
              <div className="text-sm text-muted-foreground">
                {bookingSearchInput.trim() ? "Sin reservas para la búsqueda actual" : "Sin reservas"}
              </div>
            )}
            {!loading && bookingSearchPending && (
              <div className="relative min-h-[360px]">
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border border-white/10 bg-background/60">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner size="sm" variant="primary" />
                    <span>Buscando citas...</span>
                  </div>
                </div>
              </div>
            )}
            {!loading && !bookingSearchPending && totalRecentBookings > 0 && (
              <>
                <div className="relative min-w-0">
                  <div className={desktopBookingTransitioning ? "transition-all duration-200 blur-[2px] opacity-70" : "transition-all duration-200"}>
                    <RecentBookingCard
                      booking={filteredRecentBookings[desktopBookingIndex]}
                      onOpenConversation={setConversationBooking}
                    />
                  </div>
                  {desktopBookingTransitioning && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border border-white/10 bg-background/60">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner size="sm" variant="primary" />
                        <span>Cargando cita...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => changeDesktopBooking((desktopBookingIndex - 1 + totalRecentBookings) % totalRecentBookings)}
                    className="w-full gap-1.5 px-2 text-xs shadow-neon-primary sm:px-3 sm:text-sm"
                    aria-label="Cita anterior"
                    disabled={desktopBookingTransitioning || totalRecentBookings <= 1}
                  >
                    <Icon icon={ChevronLeft} size="xs" variant="default" />
                    Anterior
                  </Button>
                  <div className="rounded-full border border-white/10 bg-background/70 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {desktopBookingIndex + 1}/{totalRecentBookings}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => changeDesktopBooking((desktopBookingIndex + 1) % totalRecentBookings)}
                    className="w-full gap-1.5 px-2 text-xs shadow-neon-primary sm:px-3 sm:text-sm"
                    aria-label="Siguiente cita"
                    disabled={desktopBookingTransitioning || totalRecentBookings <= 1}
                  >
                    Siguiente
                    <Icon icon={ChevronRight} size="xs" variant="default" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </GlassCard>

        <GlassCard className="w-full min-w-0 overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon={Users} size="sm" variant="primary" />
              <h3 className="text-base font-semibold">Actividad comercial</h3>
            </div>
            <Badge variant="accent">Resumen</Badge>
          </div>

          <div className="mt-5 flex min-h-0 flex-1 flex-col gap-5">
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

            <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2">
                <Icon icon={TimerReset} size="sm" variant="default" />
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Tendencia visual</div>
              </div>
              <div className="mt-3 flex min-h-0 flex-1 flex-col">
                {data?.charts ? (
                  <div className="flex min-h-0 flex-1 flex-col gap-3">
                    <div
                      className="grid min-h-[140px] flex-1 gap-1 md:min-h-[180px]"
                      style={{ gridTemplateColumns: `repeat(${Math.max(bookingTrend.length, 1)}, minmax(0, 1fr))` }}
                    >
                      {bookingTrend.map((value, index) => (
                        <div key={`b-${index}`} className="flex h-full flex-col items-center gap-1">
                          <div className="flex h-full w-full items-end">
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
                      className="grid min-h-[90px] flex-1 gap-1 md:min-h-[120px]"
                      style={{ gridTemplateColumns: `repeat(${Math.max(contactTrend.length, 1)}, minmax(0, 1fr))` }}
                    >
                      {contactTrend.map((value, index) => (
                        <div key={`c-${index}`} className="flex h-full flex-col items-center gap-1">
                          <div className="flex h-full w-full items-end">
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
                    <div className="flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Citas</div>
                        <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-secondary" />Leads</div>
                      </div>
                      <span className="shrink-0">Rango {rangeDays} días</span>
                    </div>
                  </div>
                ) : (
                  <SparkBars values={trendBars} />
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="w-full min-w-0 overflow-hidden p-5">
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
              <div key={contact.id} className="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="break-words text-sm font-medium">{contact.nombre}</div>
                    <div className="break-words text-xs text-muted-foreground">{contact.clinica}</div>
                    <div className="mt-1 break-all text-xs text-muted-foreground">{contact.email}</div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge variant="secondary">
                      {new Date(contact.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                    </Badge>
                    <Button type="button" variant="outline" size="sm" className="!w-auto px-3" asChild>
                      <Link href={`/admin/contacts/${contact.id}/trabajos`}>
                        <Icon icon={FolderOpen} size="xs" variant="default" className="text-current" />
                        Trabajos
                      </Link>
                    </Button>
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

      <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard className="w-full min-w-0 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Tabla rápida de operación</h3>
            <Badge variant="outline" className="w-fit">Acción sugerida</Badge>
          </div>
          <TableOverflowHint>
              <Table className="min-w-[640px] md:min-w-full">
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
          </TableOverflowHint>
        </GlassCard>

        <GlassCard className="w-full min-w-0 p-5">
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

      <div className="grid w-full min-w-0 gap-6 lg:grid-cols-2">
        <GlassCard className="w-full min-w-0 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Tabla de estadísticas (citas)</h3>
            <Badge variant="outline" className="w-fit">Estados</Badge>
          </div>
          <TableOverflowHint>
              <Table className="min-w-[640px] md:min-w-full">
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
          </TableOverflowHint>
        </GlassCard>

        <GlassCard className="w-full min-w-0 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Tabla de estadísticas (actividad)</h3>
            <Badge variant="accent" className="w-fit">Resumen</Badge>
          </div>
          <TableOverflowHint>
              <Table className="min-w-[640px] md:min-w-full">
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
          </TableOverflowHint>
        </GlassCard>
      </div>
    </div>
  )
}
