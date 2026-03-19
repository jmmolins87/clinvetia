"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Check, Trash2, X } from "lucide-react"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast as sonnerToast } from "@/components/ui/sonner"
import { Icon } from "@/components/ui/icon"
import { Toggle } from "@/components/ui/toggle"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BookingWizard, type BookingWizardSubmitPayload } from "@/components/scheduling/BookingWizard"
import { useDynamicPageSize } from "@/lib/use-dynamic-page-size"

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
  mensaje?: string
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
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [mode, setMode] = useState<"demo" | "superadmin" | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled" | "expired" | "rescheduled">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow" | "week">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleBooking, setRescheduleBooking] = useState<BookingRow | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState("")
  const [cancelDialogBooking, setCancelDialogBooking] = useState<BookingRow | null>(null)
  const [cancelEmailSubject, setCancelEmailSubject] = useState("")
  const [cancelEmailMessage, setCancelEmailMessage] = useState("")
  const [cancelEmailMailbox, setCancelEmailMailbox] = useState<"shared" | "self">("shared")
  const [isCancellingWithEmail, setIsCancellingWithEmail] = useState(false)
  const [deleteBookingTarget, setDeleteBookingTarget] = useState<BookingRow | null>(null)
  const [page, setPage] = useState(1)
  const [pageNavLoading, setPageNavLoading] = useState<"prev" | "next" | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const itemRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const pageSize = useDynamicPageSize({
    listRef,
    itemRef,
    footerRef,
    defaultSize: 6,
    deps: [bookings.length, statusFilter, dateFilter],
  })

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
        toast({
          variant: "destructive",
          title: "No se pudieron cargar las citas",
          description: err instanceof Error ? err.message : "Error al cargar reservas",
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router, toast])

  const loadBookings = useCallback(async () => {
    const res = await fetch("/api/admin/bookings", { cache: "no-store" })
    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || "Error al cargar reservas")
    }
    const data = await res.json()
    setBookings(data.bookings)
  }, [])

  useEffect(() => {
    if (!mode) return
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "clinvetia:booking-updated") return
      loadBookings().catch(() => {})
    }
    const onLocalEvent = () => {
      loadBookings().catch(() => {})
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener("clinvetia:booking-updated", onLocalEvent)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("clinvetia:booking-updated", onLocalEvent)
    }
  }, [loadBookings, mode])

  const updateBookingStatus = async (id: string, status: "confirmed" | "cancelled") => {
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
      sonnerToast.success(status === "confirmed" ? "Cita actualizada" : "Cita cancelada", {
        description: status === "confirmed" ? "La cita ha quedado confirmada." : "La cita ha quedado cancelada.",
      })
    } catch (err) {
      sonnerToast.error("No se pudo actualizar la cita", {
        description: err instanceof Error ? err.message : "No se pudo actualizar la cita",
      })
      toast({
        variant: "destructive",
        title: "No se pudo actualizar la cita",
        description: err instanceof Error ? err.message : "No se pudo actualizar la cita",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const openCancelDialog = (booking: BookingRow) => {
    const formattedDate = new Date(booking.date).toLocaleDateString("es-ES")
    const customerName = booking.nombre?.trim() || "equipo"
    setCancelDialogBooking(booking)
    setCancelEmailMailbox(mode === "demo" ? "self" : "shared")
    setCancelEmailSubject("Actualización de tu cita demo en Clinvetia")
    setCancelEmailMessage(
      `Hola ${customerName},\n\nTu cita demo del ${formattedDate} a las ${booking.time} ha sido cancelada.\n\nMotivo de la cancelación:\n\n\nSi lo prefieres, podemos ayudarte a reagendar una nueva fecha.\n\nUn saludo,\nEquipo Clinvetia`
    )
  }

  const submitCancellationWithEmail = async () => {
    if (!cancelDialogBooking) return
    if (mode === "demo") {
      setUpdatingId(cancelDialogBooking.id)
      setIsCancellingWithEmail(true)
      try {
        const statusRes = await fetch("/api/admin/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", id: cancelDialogBooking.id, status: "cancelled" }),
        })
        if (!statusRes.ok) {
          const payload = await statusRes.json().catch(() => null)
          throw new Error(payload?.error || "No se pudo cancelar la cita")
        }
        await loadBookings()
        setCancelDialogBooking(null)
        sonnerToast.success("Cita cancelada", {
          description: "Modo demo: la cita quedó cancelada correctamente.",
        })
        toast({
          title: "Cita cancelada",
          description: "Modo demo: la cita quedó cancelada correctamente.",
        })
      } catch (err) {
        sonnerToast.error("No se pudo cancelar la cita", {
          description: err instanceof Error ? err.message : "No se pudo cancelar la cita",
        })
        toast({
          variant: "destructive",
          title: "No se pudo cancelar la cita",
          description: err instanceof Error ? err.message : "No se pudo cancelar la cita",
        })
      } finally {
        setUpdatingId(null)
        setIsCancellingWithEmail(false)
      }
      return
    }
    if (!cancelDialogBooking.email) {
      toast({
        variant: "destructive",
        title: "No se puede enviar el correo",
        description: "Esta cita no tiene un email asociado para notificar la cancelación.",
      })
      return
    }
    const subject = cancelEmailSubject.trim()
    const message = cancelEmailMessage.trim()
    if (subject.length < 3 || message.length < 10) {
      toast({
        variant: "destructive",
        title: "Completa el correo de cancelación",
        description: "Añade asunto y un motivo más detallado antes de continuar.",
      })
      return
    }

    setUpdatingId(cancelDialogBooking.id)
    setIsCancellingWithEmail(true)
    try {
      const emailRes = await fetch("/api/admin/customer-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailbox: cancelEmailMailbox,
          to: cancelDialogBooking.email,
          customerName: cancelDialogBooking.nombre || undefined,
          subject,
          message,
        }),
      })
      if (!emailRes.ok) {
        const payload = await emailRes.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo enviar el correo de cancelación")
      }

      const statusRes = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", id: cancelDialogBooking.id, status: "cancelled" }),
      })
      if (!statusRes.ok) {
        const payload = await statusRes.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo cancelar la cita")
      }

      await loadBookings()
      setCancelDialogBooking(null)
      sonnerToast.success("Cita cancelada", {
        description: "Se envió el correo personalizado al cliente y la cita quedó cancelada.",
      })
      toast({
        title: "Cita cancelada",
        description: "Se envió el correo personalizado al cliente y la cita quedó cancelada.",
      })
    } catch (err) {
      sonnerToast.error("No se pudo cancelar la cita", {
        description: err instanceof Error ? err.message : "No se pudo cancelar la cita",
      })
      toast({
        variant: "destructive",
        title: "No se pudo cancelar la cita",
        description: err instanceof Error ? err.message : "No se pudo cancelar la cita",
      })
    } finally {
      setUpdatingId(null)
      setIsCancellingWithEmail(false)
    }
  }

  const deleteBooking = async (id: string) => {
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
      const payload = await res.json().catch(() => null)
      await loadBookings()
      sonnerToast.success(payload?.booking?.status === "cancelled" ? "Cita cancelada" : "Cita eliminada", {
        description:
          payload?.booking?.status === "cancelled"
            ? "La cita seguía activa y se ha cancelado directamente."
            : "La cita se ha eliminado correctamente.",
      })
      toast({
        title: payload?.booking?.status === "cancelled" ? "Cita cancelada" : "Cita eliminada",
        description:
          payload?.booking?.status === "cancelled"
            ? "La cita seguía activa y se ha cancelado directamente."
            : "La cita se ha eliminado correctamente.",
      })
    } catch (err) {
      sonnerToast.error("No se pudo eliminar la cita", {
        description: err instanceof Error ? err.message : "No se pudo eliminar la cita",
      })
      toast({
        variant: "destructive",
        title: "No se pudo eliminar la cita",
        description: err instanceof Error ? err.message : "No se pudo eliminar la cita",
      })
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
      if (booking.status === "rescheduled") acc.rescheduled += 1
      return acc
    },
    { total: 0, confirmed: 0, pending: 0, expired: 0, cancelled: 0, rescheduled: 0 }
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

    const normalizedQuery = searchQuery.trim().toLowerCase()
    const searchOk =
      normalizedQuery.length === 0 ||
      [booking.clinica, booking.nombre, booking.email]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedQuery))

    return statusOk && dateOk && searchOk
  })

  useEffect(() => {
    setPage(1)
  }, [statusFilter, dateFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize))
  const pageSafe = Math.min(page, totalPages)
  const pagedBookings = filteredBookings.slice((pageSafe - 1) * pageSize, pageSafe * pageSize)

  const changePageWithLoader = useCallback((direction: "prev" | "next") => {
    if (pageNavLoading) return
    if (direction === "prev" && pageSafe <= 1) return
    if (direction === "next" && pageSafe >= totalPages) return
    setPageNavLoading(direction)
    window.setTimeout(() => {
      setPage((current) =>
        direction === "prev" ? Math.max(1, current - 1) : Math.min(totalPages, current + 1)
      )
      setPageNavLoading(null)
    }, 1000)
  }, [pageNavLoading, pageSafe, totalPages])

  useEffect(() => {
    setPage(1)
  }, [filteredBookings.length, pageSize])

  const badgeVariantForStatus = (status: string): "primary" | "warning" | "secondary" | "destructive" | "outline" | "accent" => {
    if (status === "confirmed") return "primary"
    if (status === "pending") return "warning"
    if (status === "cancelled") return "secondary"
    if (status === "expired") return "destructive"
    if (status === "rescheduled") return "accent"
    return "outline"
  }

  const rowClassForStatus = (status: string) => {
    if (status === "confirmed") return "border-primary/20 bg-primary/5"
    if (status === "pending") return "border-warning/20 bg-warning/5"
    if (status === "cancelled") return "border-secondary/20 bg-secondary/5"
    if (status === "expired") return "border-destructive/20 bg-destructive/5"
    if (status === "rescheduled") return "border-accent/20 bg-accent/5"
    return "border-white/10 bg-white/5"
  }

  const statusLabel = (status: string) => {
    if (status === "confirmed") return "Confirmada"
    if (status === "pending") return "Pendiente"
    if (status === "cancelled") return "Cancelada"
    if (status === "expired") return "Expirada"
    if (status === "rescheduled") return "Reagendada"
    return status
  }

  const statusPanelClass = (status: string) => {
    if (status === "confirmed") {
      return "border-primary/30 bg-primary/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_35px_rgba(var(--primary-rgb),0.12)]"
    }
    if (status === "pending") {
      return "border-warning/30 bg-warning/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_35px_rgba(var(--warning-rgb),0.12)]"
    }
    if (status === "cancelled") {
      return "border-secondary/30 bg-secondary/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_35px_rgba(var(--secondary-rgb),0.12)]"
    }
    if (status === "expired") {
      return "border-destructive/30 bg-destructive/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_35px_rgba(var(--destructive-rgb),0.12)]"
    }
    if (status === "rescheduled") {
      return "border-accent/30 bg-accent/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_35px_rgba(var(--accent-rgb),0.12)]"
    }
    return "border-white/10 bg-white/5"
  }

  const statusIcon = (status: string) => {
    if (status === "confirmed") return Check
    if (status === "cancelled" || status === "expired") return X
    if (status === "rescheduled") return Check
    return AlertTriangle
  }

  const statusIconVariant = (status: string): "primary" | "warning" | "secondary" | "destructive" | "muted" | "accent" => {
    if (status === "confirmed") return "primary"
    if (status === "pending") return "warning"
    if (status === "cancelled") return "secondary"
    if (status === "expired") return "destructive"
    if (status === "rescheduled") return "accent"
    return "muted"
  }

  const openRescheduleDialog = (booking: BookingRow) => {
    setRescheduleBooking(booking)
    setRescheduleOpen(true)
  }
  const submitReschedule = async (payload: BookingWizardSubmitPayload) => {
    if (!rescheduleBooking) {
      throw new Error("Selecciona una cita para reagendar")
    }
    if (!rescheduleBooking.email?.trim()) {
      toast({
        variant: "destructive",
        title: "Correo obligatorio",
        description: "La cita debe tener un correo asociado para poder enviar el reagendado.",
      })
      throw new Error("La cita no tiene correo asociado")
    }
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
      sonnerToast.success("Cita reagendada", {
        description: "La cita se ha reagendado correctamente.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo reagendar la cita"
      sonnerToast.error("No se pudo reagendar la cita", {
        description: message,
      })
      toast({
        variant: "destructive",
        title: "No se pudo reagendar la cita",
        description: message,
      })
      throw new Error(message)
    } finally {
      setUpdatingId(null)
    }
  }

  const submitCreate = async (payload: BookingWizardSubmitPayload) => {
    const email = createEmail.trim().toLowerCase()
    if (!email) {
      toast({
        variant: "destructive",
        title: "Correo obligatorio",
        description: "Debes indicar un correo para crear y enviar la cita.",
      })
      throw new Error("Debes indicar un correo para crear la cita")
    }

    setUpdatingId("create-demo-booking")
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          date: payload.date.toISOString(),
          time: payload.time,
          duration: payload.duration,
          email,
        }),
      })

      if (!res.ok) {
        const responsePayload = await res.json().catch(() => null)
        throw new Error(responsePayload?.error || "No se pudo crear la cita")
      }

      await loadBookings()
      setCreateOpen(false)
      setCreateEmail("")
      sonnerToast.success("Cita creada", {
        description: "La nueva cita se ha creado y enviado correctamente.",
      })
      toast({
        title: "Cita creada",
        description: "La nueva cita se ha creado y enviado correctamente.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear la cita"
      sonnerToast.error("No se pudo crear la cita", {
        description: message,
      })
      toast({
        variant: "destructive",
        title: "No se pudo crear la cita",
        description: message,
      })
      throw new Error(message)
    } finally {
      setUpdatingId(null)
    }
  }

  const canOperate = mode === "superadmin" || mode === "demo"

  return (
    <div className="space-y-7">
      <Dialog open={Boolean(deleteBookingTarget)} onOpenChange={(open) => !open && setDeleteBookingTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              {deleteBookingTarget
                ? ["pending", "confirmed"].includes(deleteBookingTarget.status)
                  ? `La cita del ${new Date(deleteBookingTarget.date).toLocaleDateString("es-ES")} a las ${deleteBookingTarget.time} sigue activa. Si continúas, se cancelará automáticamente y se avisará al cliente y a info@clinvetia.com.`
                  : `Vas a eliminar la cita ${
                      deleteBookingTarget.status === "expired" ? "expirada" : "cancelada"
                    } del ${new Date(deleteBookingTarget.date).toLocaleDateString("es-ES")} a las ${deleteBookingTarget.time}.`
                : "Confirma la eliminación de la cita."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="w-full sm:flex-1" onClick={() => setDeleteBookingTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:flex-1"
              onClick={async () => {
                const id = deleteBookingTarget?.id
                setDeleteBookingTarget(null)
                if (!id) return
                await deleteBooking(id)
              }}
            >
              {deleteBookingTarget && ["pending", "confirmed"].includes(deleteBookingTarget.status)
                ? "Cancelar cita"
                : "Eliminar cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rescheduleOpen}
        onOpenChange={(open) => {
          setRescheduleOpen(open)
          if (!open) {
            setRescheduleBooking(null)
          }
        }}
      >
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
              showDurationSelector={false}
              initialDate={new Date(rescheduleBooking.date)}
              initialTime={rescheduleBooking.time}
              initialDuration={30}
              initialStep="date"
              allowUnavailableSlot={(slot, date) => {
                if (!rescheduleBooking) return false
                return slot === rescheduleBooking.time &&
                  new Date(rescheduleBooking.date).toDateString() === date.toDateString()
              }}
              loadAvailability={async (date) => {
                const res = await fetch(`/api/availability?date=${encodeURIComponent(date.toISOString().slice(0, 10))}`, { cache: "no-store" })
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
            <Button
              variant="ghost"
              onClick={() => {
                setRescheduleOpen(false)
                setRescheduleBooking(null)
              }}
              className="w-auto"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) setCreateEmail("")
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva cita</DialogTitle>
            <DialogDescription>
              Selecciona fecha y hora e indica el correo al que se enviará la cita.
            </DialogDescription>
          </DialogHeader>
          <BookingWizard
            className="border-white/10 bg-transparent p-0 shadow-none"
            title="Añadir cita"
            subtitle="Elige día, hora y duración para registrar una nueva cita"
            confirmCtaLabel="Crear cita"
            confirmingLabel="Creando..."
            showDurationSelector={false}
            initialDuration={30}
            confirmContent={
              <div className="space-y-2">
                <label htmlFor="create-booking-email" className="text-sm font-medium">
                  Correo del cliente
                </label>
                <Input
                  id="create-booking-email"
                  type="email"
                  value={createEmail}
                  onChange={(event) => setCreateEmail(event.target.value)}
                  placeholder="cliente@clinica.com"
                  required
                />
              </div>
            }
            canSubmit={Boolean(createEmail.trim())}
            initialStep="date"
            loadAvailability={async (date) => {
              const res = await fetch(`/api/availability?date=${encodeURIComponent(date.toISOString().slice(0, 10))}`, { cache: "no-store" })
              if (!res.ok) {
                const responsePayload = await res.json().catch(() => null)
                throw new Error(responsePayload?.error || "No se pudieron cargar los horarios")
              }
              const data = await res.json()
              return { slots: data.slots || [], unavailable: data.unavailable || [] }
            }}
            onSubmit={submitCreate}
          />

          <DialogFooter className="sm:[&>*]:flex-none">
            <Button variant="ghost" onClick={() => setCreateOpen(false)} className="w-auto">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(cancelDialogBooking)}
        onOpenChange={(open) => {
          if (!open && !isCancellingWithEmail) {
            setCancelDialogBooking(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Cancelar cita y notificar al cliente</DialogTitle>
            <DialogDescription>
              {mode === "demo"
                ? "Modo demo: al confirmar, la cita pasará a cancelada sin envío real de correo."
                : "Redacta un correo personalizado explicando el motivo de la cancelación. Al confirmar, se enviará el correo y la cita pasará a cancelada."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="cancel-email-mailbox" className="text-sm font-medium">Enviar desde</label>
              <Select
                id="cancel-email-mailbox"
                value={cancelEmailMailbox}
                onChange={(e) => setCancelEmailMailbox(e.target.value as "shared" | "self")}
                disabled={isCancellingWithEmail}
                className="h-10 rounded-xl px-3 pr-10"
              >
                <option value="shared">info@clinvetia.com</option>
                <option value="self">Mi correo de usuario</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="cancel-email-subject" className="text-sm font-medium">Asunto</label>
              <Input
                id="cancel-email-subject"
                value={cancelEmailSubject}
                onChange={(e) => setCancelEmailSubject(e.target.value)}
                placeholder="Asunto del correo"
                disabled={isCancellingWithEmail}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cancel-email-message" className="text-sm font-medium">Motivo de la cancelación</label>
              <Textarea
                id="cancel-email-message"
                value={cancelEmailMessage}
                onChange={(e) => setCancelEmailMessage(e.target.value)}
                rows={8}
                placeholder="Explica el motivo de la cancelación"
                disabled={isCancellingWithEmail}
              />
            </div>
            {cancelDialogBooking?.email ? (
              <p className="text-xs text-muted-foreground">
                Se enviará a: <span className="font-medium text-foreground">{cancelDialogBooking.email}</span>
              </p>
            ) : mode === "demo" ? (
              <p className="text-xs text-muted-foreground">
                Modo demo: se cancelará sin envío de correo real.
              </p>
            ) : (
              <p className="text-xs text-destructive">
                Esta cita no tiene email asociado. No se puede enviar notificación.
              </p>
            )}
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="ghost"
              className="w-full sm:flex-1"
              onClick={() => setCancelDialogBooking(null)}
              disabled={isCancellingWithEmail}
            >
              Cerrar
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:flex-1"
              onClick={submitCancellationWithEmail}
              disabled={isCancellingWithEmail || (mode !== "demo" && !cancelDialogBooking?.email)}
            >
              {isCancellingWithEmail ? "Enviando y cancelando..." : "Enviar y cancelar cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Reservas</h2>
        <div className="flex items-center gap-2">
          {canOperate && (
            <Button type="button" size="sm" variant="accent" className="!w-auto px-3" onClick={() => setCreateOpen(true)}>
              Añadir cita
            </Button>
          )}
        </div>
      </div>


      {!loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-xl font-semibold">{counts.total}</div>
            </div>
          </GlassCard>
          <GlassCard className="border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-primary">Confirmadas</div>
              <div className="text-xl font-semibold text-primary">{counts.confirmed}</div>
            </div>
          </GlassCard>
          <GlassCard className="border-warning/20 bg-warning/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-warning">Pendientes</div>
              <div className="text-xl font-semibold text-warning">{counts.pending}</div>
            </div>
          </GlassCard>
          <GlassCard className="border-secondary/20 bg-secondary/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-secondary">Canceladas</div>
              <div className="text-xl font-semibold text-secondary">{counts.cancelled}</div>
            </div>
          </GlassCard>
          <GlassCard className="border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-destructive">Expiradas</div>
              <div className="text-xl font-semibold text-destructive">{counts.expired}</div>
            </div>
          </GlassCard>
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
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setDateFilter(filter.key as typeof dateFilter)}
                  className={cn(
                    buttonVariants({
                      variant: dateFilter === filter.key ? "default" : "outline",
                      size: "sm",
                    }),
                    "w-auto rounded-full",
                    dateFilter !== filter.key && "border-white/20 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
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

            <div className="max-w-md">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por clínica, persona o email"
                className="glass"
              />
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
          <div className="text-sm text-muted-foreground">Sin reservas para los filtros/búsqueda seleccionados</div>
        )}
        {!loading && (
          <div ref={listRef} className="relative mb-4 space-y-5">
            {pagedBookings.map((booking, index) => {
              const meetLink =
                booking.status !== "cancelled" && booking.status !== "expired" && booking.status !== "rescheduled"
                  ? booking.googleMeetLink || `https://meet.google.com/new#booking-${booking.id}`
                  : null
              return (
              <div
                key={booking.id}
                ref={index === 0 ? itemRef : undefined}
                className={cn(
                  "rounded-xl border p-4 md:p-5 transition-all duration-200",
                  rowClassForStatus(booking.status),
                  pageNavLoading && "blur-[2px] opacity-70"
                )}
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(260px,1.1fr)_minmax(220px,0.95fr)] lg:items-stretch">
                  <div className="h-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 space-y-2">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Cita</div>
                    <div className="text-sm font-semibold">
                      {new Date(booking.date).toLocaleDateString("es-ES")} · {booking.time}
                    </div>
                    <div className="text-xs text-muted-foreground">{booking.duration} min</div>
                    <div className="text-xs text-muted-foreground/80 break-all">ID {booking.id}</div>
                    {meetLink ? (
                      <div className="text-xs text-muted-foreground">
                        Google Meet:{" "}
                        <a
                          href={meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-2 hover:underline break-all"
                        >
                          {meetLink}
                        </a>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Google Meet no disponible</div>
                    )}
                  </div>

                  <div className="h-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 space-y-3">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Contacto</div>
                    <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-sm font-semibold">
                      {booking.nombre || "Sin contacto aún"}
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {booking.clinica && <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2">Clínica: {booking.clinica}</div>}
                      {booking.telefono && <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2">Tel: {booking.telefono}</div>}
                      {booking.email && <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2 break-all">{booking.email}</div>}
                      {!booking.clinica && !booking.telefono && !booking.email && (
                        <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2">Pendiente de datos</div>
                      )}
                    </div>
                    {booking.mensaje && (
                      <div className="rounded-lg border border-white/10 bg-background/50 px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap">
                        {booking.mensaje}
                      </div>
                    )}
                  </div>

                  <div className={cn("h-full rounded-xl border px-4 py-3 backdrop-blur-md", statusPanelClass(booking.status))}>
                    <div className="flex h-full flex-col justify-between gap-4 lg:min-w-[220px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {canOperate ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={updatingId === booking.id}
                              onClick={() => setDeleteBookingTarget(booking)}
                              className="!w-auto shrink-0 cursor-pointer border border-destructive/30 bg-destructive/10 px-2.5 text-destructive hover:bg-destructive/15"
                              aria-label={
                                booking.status === "pending"
                                  ? "Cancelar cita pendiente"
                                  : booking.status === "confirmed"
                                    ? "Cancelar cita activa"
                                    : booking.status === "expired"
                                      ? "Eliminar cita expirada"
                                      : "Eliminar cita cancelada"
                              }
                              title={
                                booking.status === "pending"
                                  ? "Cancelar cita pendiente"
                                  : booking.status === "confirmed"
                                    ? "Cancelar cita activa"
                                    : booking.status === "expired"
                                      ? "Eliminar cita expirada"
                                      : "Eliminar cita cancelada"
                              }
                            >
                              {updatingId === booking.id ? (
                                "..."
                              ) : (
                                <Icon icon={Trash2} size="default" variant="destructive" />
                              )}
                            </Button>
                          ) : null}
                        </div>
                        <Badge variant={badgeVariantForStatus(booking.status)}>{statusLabel(booking.status)}</Badge>
                      </div>
                      <div className="flex flex-1 items-center justify-center">
                        <div className="flex size-28 items-center justify-center rounded-full border border-white/10 bg-background/25 backdrop-blur-xl">
                          <Icon icon={statusIcon(booking.status)} size="2xl" variant={statusIconVariant(booking.status)} className="size-16" />
                        </div>
                      </div>
                      <div className="border-t border-white/10 sm:hidden" />

                      {canOperate && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap lg:justify-end">
                          {booking.status !== "expired" && booking.status !== "rescheduled" && (
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              disabled={booking.status === "confirmed" || booking.status === "cancelled" || updatingId === booking.id}
                              onClick={() => updateBookingStatus(booking.id, "confirmed")}
                              className="w-full sm:w-[120px] shrink-0 cursor-pointer px-3"
                            >
                              {updatingId === booking.id ? "Actualizando..." : "Aceptar"}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="accent"
                            size="sm"
                            onClick={() => openRescheduleDialog(booking)}
                            className="w-full sm:w-[120px] shrink-0 cursor-pointer px-3 shadow-[0_0_14px_rgba(var(--accent-rgb),0.22)] disabled:opacity-100"
                          >
                            Reagendar
                          </Button>
                          {booking.status !== "expired" && booking.status !== "rescheduled" ? (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={booking.status === "cancelled" || updatingId === booking.id}
                              onClick={() => openCancelDialog(booking)}
                              className="w-full sm:w-[120px] shrink-0 cursor-pointer px-3"
                            >
                              {updatingId === booking.id ? "Actualizando..." : "Cancelar"}
                            </Button>
                          ) : (
                            <span className="hidden sm:block w-[120px] shrink-0" aria-hidden="true" />
                          )}
                        </div>
                      )}

                      {!canOperate && <div />}
                    </div>
                  </div>
                </div>
                {booking.emailEvents && booking.emailEvents.length > 0 && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-background/50 p-3 space-y-2">
                    {booking.emailEvents && booking.emailEvents.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Historial de correos</div>
                        {booking.emailEvents
                          .slice()
                          .reverse()
                          .slice(0, 4)
                          .map((event, eventIndex) => (
                            <div key={`${booking.id}-email-${eventIndex}`} className="text-xs text-muted-foreground">
                              <span className={event.status === "sent" ? "text-primary" : "text-destructive"}>
                                {event.status === "sent" ? "Enviado" : "Error"}
                              </span>{" "}
                              · {event.subject} · {new Date(event.sentAt).toLocaleString("es-ES")} · destino:{" "}
                              <span className="break-all">{event.deliveredTo}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )})}
            {pageNavLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border border-white/10 bg-background/55 backdrop-blur-sm">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner size="sm" variant="primary" />
                  Cargando citas...
                </div>
              </div>
            )}
          </div>
        )}
        {!loading && filteredBookings.length > 0 && (
          <div
            ref={footerRef}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-muted-foreground"
          >
            <span>
              Página {pageSafe} de {totalPages} · {filteredBookings.length} citas
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="!w-auto"
                disabled={pageSafe <= 1 || pageNavLoading !== null}
                onClick={() => changePageWithLoader("prev")}
              >
                {pageNavLoading === "prev" ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" variant="primary" />
                    Cargando...
                  </span>
                ) : "Anterior"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="!w-auto"
                disabled={pageSafe >= totalPages || pageNavLoading !== null}
                onClick={() => changePageWithLoader("next")}
              >
                {pageNavLoading === "next" ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" variant="primary" />
                    Cargando...
                  </span>
                ) : "Siguiente"}
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
