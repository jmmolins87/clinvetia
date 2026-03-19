"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { DayButtonProps } from "react-day-picker"
import { CalendarDays } from "lucide-react"

import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Icon } from "@/components/ui/icon"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"

type CalendarBooking = {
  id: string
  date: string
  time: string
  duration: number
  status: string
  nombre?: string
  clinica?: string
  email?: string
}

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function bookingDateKey(date: string) {
  return date.slice(0, 10)
}

function isSameMonthDate(date: Date, month: Date) {
  return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()
}

function sortBookingsByDateTime(bookings: CalendarBooking[]) {
  return bookings.slice().sort((left, right) => {
    const leftValue = new Date(`${bookingDateKey(left.date)}T${left.time}:00`).getTime()
    const rightValue = new Date(`${bookingDateKey(right.date)}T${right.time}:00`).getTime()
    return leftValue - rightValue
  })
}

function statusLabel(status: string) {
  if (status === "confirmed") return "Confirmada"
  if (status === "pending") return "Pendiente"
  if (status === "cancelled") return "Cancelada"
  if (status === "expired") return "Expirada"
  return status
}

function statusBadgeVariant(status: string): "primary" | "warning" | "destructive" | "outline" | "secondary" | "accent" {
  if (status === "confirmed") return "primary"
  if (status === "pending") return "warning"
  if (status === "cancelled") return "secondary"
  if (status === "expired") return "destructive"
  return "accent"
}

export default function AdminCalendarPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<CalendarBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" })
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudieron cargar las citas")
      }
      const payload = (await res.json()) as { bookings?: CalendarBooking[] }
      setBookings(Array.isArray(payload.bookings) ? payload.bookings : [])
    } catch (err) {
      toast({
        variant: "destructive",
        title: "No se pudo cargar el calendario",
        description: err instanceof Error ? err.message : "Error al cargar citas",
      })
    } finally {
      setLoading(false)
    }
  }, [router, toast])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "clinvetia:booking-updated") return
      load()
    }
    const onLocalEvent = () => load()
    window.addEventListener("storage", onStorage)
    window.addEventListener("clinvetia:booking-updated", onLocalEvent)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("clinvetia:booking-updated", onLocalEvent)
    }
  }, [load])

  const bookingCountsByDate = useMemo(() => {
    return bookings.reduce<Record<string, number>>((acc, booking) => {
      const key = bookingDateKey(booking.date)
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
  }, [bookings])
  const bookingStatusesByDate = useMemo(() => {
    return bookings.reduce<Record<string, Set<string>>>((acc, booking) => {
      const key = bookingDateKey(booking.date)
      if (!acc[key]) {
        acc[key] = new Set<string>()
      }
      acc[key].add(booking.status)
      return acc
    }, {})
  }, [bookings])
  const bookedDates = useMemo(() => {
    return Object.keys(bookingCountsByDate).map((key) => {
      const [year, month, day] = key.split("-").map(Number)
      return new Date(year, month - 1, day)
    })
  }, [bookingCountsByDate])
  const selectedKey = dateKey(selectedDate)
  const selectedDayBookings = useMemo(() => {
    return sortBookingsByDateTime(bookings.filter((booking) => bookingDateKey(booking.date) === selectedKey))
  }, [bookings, selectedKey])
  const monthBookings = useMemo(() => {
    return sortBookingsByDateTime(bookings.filter((booking) => isSameMonthDate(new Date(booking.date), calendarMonth)))
  }, [bookings, calendarMonth])
  const monthSummary = useMemo(() => {
    return monthBookings.reduce(
      (acc, booking) => {
        acc.total += 1
        if (booking.status === "confirmed") acc.confirmed += 1
        if (booking.status === "pending") acc.pending += 1
        if (booking.status === "cancelled") acc.cancelled += 1
        if (booking.status === "expired") acc.expired += 1
        return acc
      },
      { total: 0, confirmed: 0, pending: 0, cancelled: 0, expired: 0 }
    )
  }, [monthBookings])
  const nextUpcomingBookings = useMemo(() => {
    const now = Date.now()
    return sortBookingsByDateTime(bookings)
      .filter((booking) => new Date(`${bookingDateKey(booking.date)}T${booking.time}:00`).getTime() >= now)
      .slice(0, 4)
  }, [bookings])
  const monthLabel = calendarMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })

  const DayButton = useCallback(({ day, modifiers, className, ...props }: DayButtonProps) => {
    const key = dateKey(day.date)
    const total = bookingCountsByDate[key] ?? 0
    const statuses = bookingStatusesByDate[key]
    const toneClass = statuses?.has("pending")
      ? "border-warning/40 bg-warning/15 text-warning"
      : statuses?.has("confirmed")
        ? "border-primary/40 bg-primary/15 text-primary"
        : statuses?.has("cancelled")
          ? "border-secondary/40 bg-secondary/15 text-secondary"
          : statuses?.has("expired")
            ? "border-destructive/40 bg-destructive/15 text-destructive"
            : "border-white/10 bg-white/10 text-muted-foreground"

    return (
      <button {...props} className={className}>
        <span className="flex h-full w-full flex-col items-center justify-between rounded-[inherit] px-1.5 py-1.5">
          <span className={modifiers.outside ? "text-muted-foreground/40" : ""}>{day.date.getDate()}</span>
          {total > 0 ? (
            <span className={`min-w-5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${toneClass}`}>
              {total}
            </span>
          ) : (
            <span className="h-[14px]" aria-hidden="true" />
          )}
        </span>
      </button>
    )
  }, [bookingCountsByDate, bookingStatusesByDate])

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Icon icon={CalendarDays} size="sm" variant="primary" />
            <h2 className="text-2xl font-semibold">Calendario</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Agenda mensual de todas las citas con detalle diario.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize">{monthLabel}</Badge>
          <Button variant="ghost" size="sm" className="w-auto px-3" asChild>
            <Link href="/admin/bookings">Ir a citas</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <GlassCard className="min-w-0 p-4 sm:p-5">
          <Calendar
            mode="single"
            month={calendarMonth}
            selected={selectedDate}
            onMonthChange={setCalendarMonth}
            onSelect={(date) => {
              if (!date) return
              setSelectedDate(date)
              setCalendarMonth(date)
            }}
            modifiers={{ booked: bookedDates }}
            className="border-0 bg-transparent p-0 shadow-none"
            classNames={{
              month: "grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-4",
              month_grid: "col-span-3 w-full border-collapse space-y-2",
              weekday: "w-full text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground/75",
              week: "mt-2 grid grid-cols-7 gap-2",
              day: "h-auto w-auto p-0",
              day_button:
                "h-14 w-full rounded-2xl border border-white/10 bg-white/5 p-0 text-sm font-medium text-foreground shadow-none transition-all hover:border-[rgba(var(--primary-rgb),0.35)] hover:bg-primary/10 hover:text-primary md:h-16",
              selected:
                "[&>button]:border-[rgba(var(--primary-rgb),0.8)] [&>button]:bg-primary/20 [&>button]:text-primary [&>button]:shadow-[0_0_24px_rgba(var(--primary-rgb),0.24)]",
              today: "[&>button]:border-[rgba(var(--accent-rgb),0.45)] [&>button]:bg-accent/10 [&>button]:text-accent",
              outside: "opacity-60",
            }}
            components={{ DayButton }}
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-background/50 px-3 py-2">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Mes</div>
              <div className="mt-1 text-lg font-semibold">{monthSummary.total}</div>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
              <div className="text-[11px] uppercase tracking-wider text-primary">Confirmadas</div>
              <div className="mt-1 text-lg font-semibold text-primary">{monthSummary.confirmed}</div>
            </div>
            <div className="rounded-xl border border-warning/20 bg-warning/5 px-3 py-2">
              <div className="text-[11px] uppercase tracking-wider text-warning">Pendientes</div>
              <div className="mt-1 text-lg font-semibold text-warning">{monthSummary.pending}</div>
            </div>
            <div className="rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-2">
              <div className="text-[11px] uppercase tracking-wider text-secondary">Canceladas</div>
              <div className="mt-1 text-lg font-semibold text-secondary">{monthSummary.cancelled}</div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard className="min-w-0 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Agenda del día</div>
                <div className="mt-1 text-lg font-semibold">
                  {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </div>
              </div>
              <Badge variant={selectedDayBookings.length > 0 ? "primary" : "outline"}>
                {selectedDayBookings.length} cita{selectedDayBookings.length === 1 ? "" : "s"}
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {loading && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Spinner size="sm" variant="primary" />
                  <span>Cargando agenda...</span>
                </div>
              )}
              {!loading && selectedDayBookings.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-background/40 px-4 py-6 text-sm text-muted-foreground">
                  No hay citas programadas para este día.
                </div>
              )}
              {!loading && selectedDayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={
                    booking.status === "pending"
                      ? "rounded-2xl border border-warning/20 bg-warning/5 p-4"
                      : booking.status === "confirmed"
                        ? "rounded-2xl border border-primary/20 bg-primary/5 p-4"
                        : booking.status === "cancelled"
                          ? "rounded-2xl border border-secondary/20 bg-secondary/5 p-4"
                          : booking.status === "expired"
                            ? "rounded-2xl border border-destructive/20 bg-destructive/5 p-4"
                            : "rounded-2xl border border-white/10 bg-background/40 p-4"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{booking.time} · {booking.duration} min</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {booking.nombre || booking.clinica || booking.email || "Cita sin contacto asignado"}
                      </div>
                      {(booking.clinica || booking.email) && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {[booking.clinica, booking.email].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>
                    <Badge variant={statusBadgeVariant(booking.status)}>{statusLabel(booking.status)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="min-w-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Próximas citas</div>
                <div className="mt-1 text-sm font-semibold">Siguientes huecos ocupados</div>
              </div>
              <Badge variant="accent">Live</Badge>
            </div>

            <div className="mt-4 space-y-3">
              {loading && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Spinner size="sm" variant="accent" />
                  <span>Sincronizando próximos eventos...</span>
                </div>
              )}
              {!loading && nextUpcomingBookings.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-background/40 px-4 py-5 text-sm text-muted-foreground">
                  No hay citas futuras registradas.
                </div>
              )}
              {!loading && nextUpcomingBookings.map((booking) => (
                <button
                  key={booking.id}
                  type="button"
                  onClick={() => {
                    const nextDate = new Date(booking.date)
                    setSelectedDate(nextDate)
                    setCalendarMonth(nextDate)
                  }}
                  className="w-full rounded-xl border border-white/10 bg-background/45 px-3 py-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(booking.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} · {booking.time}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {booking.nombre || booking.clinica || booking.email || "Sin contacto"}
                      </div>
                    </div>
                    <Badge variant={statusBadgeVariant(booking.status)}>{statusLabel(booking.status)}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
