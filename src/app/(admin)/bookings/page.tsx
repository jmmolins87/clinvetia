"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Icon } from "@/components/ui/icon"
import { Toggle } from "@/components/ui/toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BookingWizard, type BookingWizardSubmitPayload } from "@/components/scheduling/BookingWizard"

type BookingRow = {
  id: string
  date: string
  time: string
  duration: number
  status: string
  nombre?: string
  telefono?: string
  clinica?: string
  email?: string
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [mode, setMode] = useState<"demo" | "superadmin" | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled" | "expired">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow" | "week">("all")
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleBooking, setRescheduleBooking] = useState<BookingRow | null>(null)
  const [deleteBookingTarget, setDeleteBookingTarget] = useState<BookingRow | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch("/api/admin/me", { cache: "no-store" })
        if (meRes.status === 401) {
          router.push("/admin/login")
          return
        }
        const meData = await meRes.json()
        setMode(meData.admin.role)

        const res = await fetch("/api/admin/bookings", { cache: "no-store" })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || "Error al cargar reservas")
        }
        const data = await res.json()
        setBookings(data.bookings)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar reservas")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  const loadBookings = async () => {
    const res = await fetch("/api/admin/bookings", { cache: "no-store" })
    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || "Error al cargar reservas")
    }
    const data = await res.json()
    setBookings(data.bookings)
  }

  const updateBookingStatus = async (id: string, status: "confirmed" | "cancelled") => {
    setError(null)
    setUpdatingId(id)
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", id, status }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo actualizar la cita")
      }
      await loadBookings()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la cita")
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteBooking = async (id: string) => {
    setError(null)
    setUpdatingId(id)
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo eliminar la cita")
      }
      await loadBookings()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la cita")
    } finally {
      setUpdatingId(null)
    }
  }

  const visibleBookings = bookings.filter((booking) => {
    if (booking.status !== "cancelled") return true
    const bookingDate = new Date(booking.date)
    const endOfDay = new Date(bookingDate)
    endOfDay.setHours(23, 59, 59, 999)
    return endOfDay.getTime() >= Date.now()
  })

  const counts = visibleBookings.reduce(
    (acc, booking) => {
      acc.total += 1
      if (booking.status === "confirmed") acc.confirmed += 1
      if (booking.status === "pending") acc.pending += 1
      if (booking.status === "expired") acc.expired += 1
      if (booking.status === "cancelled") acc.cancelled += 1
      return acc
    },
    { total: 0, confirmed: 0, pending: 0, expired: 0, cancelled: 0 }
  )

  const filteredBookings = visibleBookings.filter((booking) => {
    const bookingDate = new Date(booking.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(today.getDate() + 2)
    const weekEnd = new Date(today)
    weekEnd.setDate(today.getDate() + 7)

    const statusOk = statusFilter === "all" ? true : booking.status === statusFilter
    const dateOk =
      dateFilter === "all"
        ? true
        : dateFilter === "today"
          ? bookingDate >= today && bookingDate < tomorrow
          : dateFilter === "tomorrow"
            ? bookingDate >= tomorrow && bookingDate < dayAfterTomorrow
            : bookingDate >= today && bookingDate < weekEnd

    return statusOk && dateOk
  })

  const badgeVariantForStatus = (status: string): "primary" | "warning" | "secondary" | "destructive" | "outline" => {
    if (status === "confirmed") return "primary"
    if (status === "pending") return "warning"
    if (status === "cancelled") return "secondary"
    if (status === "expired") return "destructive"
    return "outline"
  }

  const rowClassForStatus = (status: string) => {
    if (status === "confirmed") return "border-primary/20 bg-primary/5"
    if (status === "pending") return "border-warning/20 bg-warning/5"
    if (status === "cancelled") return "border-secondary/20 bg-secondary/5"
    if (status === "expired") return "border-destructive/20 bg-destructive/5"
    return "border-white/10 bg-white/5"
  }

  const openRescheduleDialog = (booking: BookingRow) => {
    setError(null)
    setRescheduleBooking(booking)
    setRescheduleOpen(true)
  }
  const submitReschedule = async (payload: BookingWizardSubmitPayload) => {
    if (!rescheduleBooking) {
      throw new Error("Selecciona una cita para reagendar")
    }
    setError(null)
    setUpdatingId(rescheduleBooking.id)
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          id: rescheduleBooking.id,
          date: payload.date.toISOString(),
          time: payload.time,
          duration: payload.duration,
        }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo reagendar la cita")
      }

      await loadBookings()
      setRescheduleOpen(false)
      setRescheduleBooking(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo reagendar la cita"
      setError(message)
      throw new Error(message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-7">
      <Dialog open={Boolean(deleteBookingTarget)} onOpenChange={(open) => !open && setDeleteBookingTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              {deleteBookingTarget
                ? `Vas a eliminar la cita cancelada del ${new Date(deleteBookingTarget.date).toLocaleDateString("es-ES")} a las ${deleteBookingTarget.time}.`
                : "Confirma la eliminación de la cita."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:[&>*]:flex-none">
            <Button variant="ghost" className="!w-auto" onClick={() => setDeleteBookingTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="!w-auto"
              onClick={async () => {
                const id = deleteBookingTarget?.id
                setDeleteBookingTarget(null)
                if (!id) return
                await deleteBooking(id)
              }}
            >
              Eliminar cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reagendar cita</DialogTitle>
            <DialogDescription>
              Selecciona una nueva fecha y hora. Se enviará un correo de confirmación al cliente.
            </DialogDescription>
          </DialogHeader>
          {rescheduleBooking && (
            <BookingWizard
              className="border-white/10 bg-transparent p-0 shadow-none"
              title="Reagendar cita"
              subtitle="Elige un nuevo día, revisa los horarios y confirma la nueva fecha"
              confirmCtaLabel="Confirmar reagendado"
              confirmingLabel="Reagendando..."
              initialDate={new Date(rescheduleBooking.date)}
              initialTime={rescheduleBooking.time}
              initialDuration={rescheduleBooking.duration}
              initialStep="date"
              allowUnavailableSlot={(slot, date) => {
                if (!rescheduleBooking) return false
                return slot === rescheduleBooking.time &&
                  new Date(rescheduleBooking.date).toDateString() === date.toDateString()
              }}
              loadAvailability={async (date) => {
                const res = await fetch(`/api/availability?date=${encodeURIComponent(date.toISOString())}`, { cache: "no-store" })
                if (!res.ok) {
                  const payload = await res.json().catch(() => null)
                  throw new Error(payload?.error || "No se pudieron cargar los horarios")
                }
                const data = await res.json()
                return { slots: data.slots || [], unavailable: data.unavailable || [] }
              }}
              onSubmit={submitReschedule}
            />
          )}

          <DialogFooter className="sm:[&>*]:flex-none">
            <Button variant="ghost" onClick={() => setRescheduleOpen(false)} className="w-auto">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Reservas</h2>
        {mode && <Badge variant={mode === "superadmin" ? "primary" : "secondary"}>{mode}</Badge>}
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      {!loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <GlassCard className="p-4"><div className="text-xs text-muted-foreground">Total</div><div className="text-xl font-semibold">{counts.total}</div></GlassCard>
          <GlassCard className="border-primary/20 bg-primary/5 p-4"><div className="text-xs text-primary">Confirmadas</div><div className="text-xl font-semibold text-primary">{counts.confirmed}</div></GlassCard>
          <GlassCard className="border-warning/20 bg-warning/5 p-4"><div className="text-xs text-warning">Pendientes</div><div className="text-xl font-semibold text-warning">{counts.pending}</div></GlassCard>
          <GlassCard className="border-secondary/20 bg-secondary/5 p-4"><div className="text-xs text-secondary">Canceladas</div><div className="text-xl font-semibold text-secondary">{counts.cancelled}</div></GlassCard>
          <GlassCard className="border-destructive/20 bg-destructive/5 p-4"><div className="text-xs text-destructive">Expiradas</div><div className="text-xl font-semibold text-destructive">{counts.expired}</div></GlassCard>
        </div>
      )}

      <GlassCard className="p-6 space-y-6">
        {!loading && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3.5">
              {[
                { key: "all", label: "Todas las fechas" },
                { key: "today", label: "Hoy" },
                { key: "tomorrow", label: "Mañana" },
                { key: "week", label: "Próximos 7 días" },
              ].map((filter) => (
                <Toggle
                  key={filter.key}
                  pressed={dateFilter === filter.key}
                  onPressedChange={() => setDateFilter(filter.key as typeof dateFilter)}
                  variant={dateFilter === filter.key ? "accent" : "outline"}
                  size="sm"
                  className="rounded-full transition-transform hover:scale-[1.02]"
                >
                  {filter.label}
                </Toggle>
              ))}
            </div>

            <div className="flex flex-wrap gap-3.5">
              {[
                { key: "all", label: "Todas", count: counts.total, variant: "outline" as const },
                { key: "pending", label: "Pendientes", count: counts.pending, variant: "warning" as const },
                { key: "confirmed", label: "Confirmadas", count: counts.confirmed, variant: "default" as const },
                { key: "cancelled", label: "Canceladas", count: counts.cancelled, variant: "secondary" as const },
                { key: "expired", label: "Expiradas", count: counts.expired, variant: "destructive" as const },
              ].map((filter) => (
                <Toggle
                  key={filter.key}
                  pressed={statusFilter === filter.key}
                  onPressedChange={() => setStatusFilter(filter.key as typeof statusFilter)}
                  variant={statusFilter === filter.key ? filter.variant : "outline"}
                  size="sm"
                  className="rounded-full transition-transform hover:scale-[1.02]"
                >
                  {filter.label} · {filter.count}
                </Toggle>
              ))}
            </div>
          </div>
        )}

        {!loading && <div className="border-t border-white/10 my-4" />}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Spinner size="sm" variant="primary" />
            <span>Cargando citas...</span>
          </div>
        )}
        {!loading && filteredBookings.length === 0 && (
          <div className="text-sm text-muted-foreground">Sin reservas para los filtros seleccionados</div>
        )}
        {!loading && (
          <div className="space-y-5">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className={`rounded-xl border p-4 md:p-5 ${rowClassForStatus(booking.status)}`}>
                <div className="grid gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(260px,1.1fr)_auto] xl:items-stretch">
                  <div className="h-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 space-y-2">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Cita</div>
                    <div className="text-sm font-semibold">
                      {new Date(booking.date).toLocaleDateString("es-ES")} · {booking.time}
                    </div>
                    <div className="text-xs text-muted-foreground">{booking.duration} min</div>
                    <div className="text-xs text-muted-foreground/80">ID {booking.id.slice(-6)}</div>
                  </div>

                  <div className="h-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 space-y-2">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Contacto</div>
                    <div className="text-sm font-semibold">{booking.nombre || "Sin contacto aún"}</div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {booking.clinica && <div>Clínica: {booking.clinica}</div>}
                      {booking.telefono && <div>Tel: {booking.telefono}</div>}
                      {booking.email && <div className="break-all">{booking.email}</div>}
                      {!booking.clinica && !booking.telefono && !booking.email && <div>Pendiente de datos</div>}
                    </div>
                  </div>

                  <div className="h-full rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex h-full flex-col justify-between gap-4 xl:min-w-[250px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {booking.status === "cancelled" && mode === "superadmin" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={updatingId === booking.id}
                              onClick={() => setDeleteBookingTarget(booking)}
                              className="!w-auto shrink-0 cursor-pointer border border-destructive/30 bg-destructive/10 px-2.5 text-destructive hover:bg-destructive/15"
                              aria-label="Eliminar cita cancelada"
                              title="Eliminar cita cancelada"
                            >
                              {updatingId === booking.id ? (
                                "..."
                              ) : (
                                <Icon icon={Trash2} size="default" variant="destructive" />
                              )}
                            </Button>
                          ) : null}
                        </div>
                        <Badge variant={badgeVariantForStatus(booking.status)}>{booking.status}</Badge>
                      </div>

                      {mode === "superadmin" && (
                        <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap xl:justify-end">
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            disabled={booking.status === "confirmed" || updatingId === booking.id}
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            className="!w-auto shrink-0 cursor-pointer px-3"
                          >
                            {updatingId === booking.id ? "Actualizando..." : "Aceptar"}
                          </Button>
                          <Button
                            type="button"
                            variant="accent"
                            size="sm"
                            onClick={() => openRescheduleDialog(booking)}
                            className="!w-auto shrink-0 cursor-pointer px-3 shadow-[0_0_14px_rgba(var(--accent-rgb),0.22)] disabled:opacity-100"
                          >
                            Reagendar
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={(booking.status === "cancelled" || booking.status === "expired") || updatingId === booking.id}
                            onClick={() => updateBookingStatus(booking.id, "cancelled")}
                            className="!w-auto shrink-0 cursor-pointer px-3"
                          >
                            {updatingId === booking.id ? "Actualizando..." : "Cancelar"}
                          </Button>
                        </div>
                      )}

                      {mode !== "superadmin" && <div />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
