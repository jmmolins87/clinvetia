"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { DayButtonProps } from "react-day-picker"
import { ArrowLeft, CalendarCheck2, CalendarDays, Check, MessageCircle, Trash2, Video, X } from "lucide-react"

import { BookingWizard, type BookingWizardSubmitPayload } from "@/components/scheduling/BookingWizard"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast as sonnerToast } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type CalendarBooking = {
  id: string
  date: string
  time: string
  duration: number
  status: string
  nombre?: string
  clinica?: string
  email?: string
  googleMeetLink?: string | null
  conversationSummary?: string
  conversationMessages?: Array<{
    role: "assistant" | "user"
    content: string
    timestamp: string
  }>
}

type CalendarActionType = "confirm" | "cancel" | "reschedule" | "meet" | "delete"
type SummaryFilter = "month" | "confirmed" | "pending" | "cancelled" | "rescheduled"

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

function isPastCalendarDate(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate.getTime() < today.getTime()
}

function isPastTimeSlot(date: Date, slot: string) {
  const now = new Date()
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (compareDate.getTime() !== today.getTime()) return false

  const [hour, min] = slot.split(":").map(Number)
  const slotTime = new Date(date)
  slotTime.setHours(hour, min, 0, 0)
  return slotTime <= now
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
  if (status === "rescheduled") return "Reagendada"
  return status
}

function statusBadgeVariant(status: string): "primary" | "warning" | "destructive" | "outline" | "secondary" | "accent" {
  if (status === "confirmed") return "primary"
  if (status === "pending") return "warning"
  if (status === "cancelled") return "secondary"
  if (status === "expired") return "destructive"
  if (status === "rescheduled") return "accent"
  return "accent"
}

function bookingCardClass(status: string) {
  if (status === "pending") {
    return "w-full cursor-pointer rounded-2xl border border-warning/20 bg-warning/5 p-4 text-left transition-all hover:border-warning/40 hover:bg-warning/10"
  }
  if (status === "confirmed") {
    return "w-full cursor-pointer rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/10"
  }
  if (status === "cancelled") {
    return "w-full cursor-pointer rounded-2xl border border-secondary/20 bg-secondary/5 p-4 text-left transition-all hover:border-secondary/40 hover:bg-secondary/10"
  }
  if (status === "rescheduled") {
    return "w-full cursor-pointer rounded-2xl border border-accent/80 bg-[rgba(var(--accent-rgb),0.2)] p-4 text-left transition-all hover:border-accent hover:bg-[rgba(var(--accent-rgb),0.26)]"
  }
  if (status === "expired") {
    return "w-full cursor-pointer rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-left transition-all hover:border-destructive/40 hover:bg-destructive/10"
  }
  return "w-full cursor-pointer rounded-2xl border border-white/10 bg-background/40 p-4 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
}

function summaryFilterLabel(filter: SummaryFilter) {
  if (filter === "month") return "Mes"
  if (filter === "confirmed") return "Confirmadas"
  if (filter === "pending") return "Pendientes"
  if (filter === "cancelled") return "Canceladas"
  return "Reagendadas"
}

function HoverPopoverLabel({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          className={cn("block max-w-full truncate", className)}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          {label}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="max-w-[220px] px-3 py-2 text-xs font-medium"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {label}
      </PopoverContent>
    </Popover>
  )
}

export default function AdminCalendarPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<CalendarBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<"demo" | "admin" | "superadmin" | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [activeBooking, setActiveBooking] = useState<CalendarBooking | null>(null)
  const [confirmAction, setConfirmAction] = useState<CalendarActionType | null>(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleBooking, setRescheduleBooking] = useState<CalendarBooking | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState("")
  const [createDate, setCreateDate] = useState<Date | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [dayPage, setDayPage] = useState(1)
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [dayPageLoading, setDayPageLoading] = useState<"prev" | "next" | "date" | null>(null)
  const [upcomingPageLoading, setUpcomingPageLoading] = useState<"prev" | "next" | null>(null)
  const [selectedDateCanCreate, setSelectedDateCanCreate] = useState(true)
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilter>("month")
  const [summaryModalOpen, setSummaryModalOpen] = useState(false)
  const [summaryPage, setSummaryPage] = useState(1)
  const [summarySearch, setSummarySearch] = useState("")
  const [summaryModalLoading, setSummaryModalLoading] = useState<"search" | "prev" | "next" | null>(null)
  const [summaryDetailBooking, setSummaryDetailBooking] = useState<CalendarBooking | null>(null)
  const [mobileDayAgendaOpen, setMobileDayAgendaOpen] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  const load = useCallback(async () => {
    try {
      const meRes = await fetch("/api/admin/me", { cache: "no-store" })
      if (meRes.status === 401) {
        router.push("/admin/login")
        return
      }
      const mePayload = await meRes.json().catch(() => null)
      setMode(mePayload?.admin?.role ?? null)

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
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches)
    syncViewport()
    mediaQuery.addEventListener("change", syncViewport)
    return () => {
      mediaQuery.removeEventListener("change", syncViewport)
    }
  }, [])

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

  const bookingStatusCountsByDate = useMemo(() => {
    return bookings.reduce<Record<string, { pending: number; confirmed: number; cancelled: number; expired: number; rescheduled: number }>>((acc, booking) => {
      const key = bookingDateKey(booking.date)
      if (!acc[key]) {
        acc[key] = { pending: 0, confirmed: 0, cancelled: 0, expired: 0, rescheduled: 0 }
      }
      if (booking.status === "pending") acc[key].pending += 1
      if (booking.status === "confirmed") acc[key].confirmed += 1
      if (booking.status === "cancelled") acc[key].cancelled += 1
      if (booking.status === "expired") acc[key].expired += 1
      if (booking.status === "rescheduled") acc[key].rescheduled += 1
      return acc
    }, {})
  }, [bookings])
  const bookedDates = useMemo(() => {
    return Object.keys(bookingStatusCountsByDate).map((key) => {
      const [year, month, day] = key.split("-").map(Number)
      return new Date(year, month - 1, day)
    })
  }, [bookingStatusCountsByDate])
  const selectedKey = dateKey(selectedDate)
  const selectedDayBookings = useMemo(() => {
    return sortBookingsByDateTime(bookings.filter((booking) => bookingDateKey(booking.date) === selectedKey))
  }, [bookings, selectedKey])
  const dayPageSize = 3
  const totalDayPages = Math.max(1, Math.ceil(selectedDayBookings.length / dayPageSize))
  const safeDayPage = Math.min(dayPage, totalDayPages)
  const pagedSelectedDayBookings = useMemo(() => {
    const start = (safeDayPage - 1) * dayPageSize
    return selectedDayBookings.slice(start, start + dayPageSize)
  }, [safeDayPage, selectedDayBookings])
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
        if (booking.status === "rescheduled") acc.rescheduled += 1
        return acc
      },
      { total: 0, confirmed: 0, pending: 0, cancelled: 0, expired: 0, rescheduled: 0 }
    )
  }, [monthBookings])
  const summaryBookings = useMemo(() => {
    if (summaryFilter === "month") return monthBookings
    return monthBookings.filter((booking) => booking.status === summaryFilter)
  }, [monthBookings, summaryFilter])
  const filteredSummaryBookings = useMemo(() => {
    const query = summarySearch.trim().toLowerCase()
    if (!query) return summaryBookings

    return summaryBookings.filter((booking) => {
      const parts = [
        booking.id,
        booking.date,
        booking.time,
        booking.nombre,
        booking.clinica,
        booking.email,
        new Date(booking.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
      ]

      return parts.some((part) => part?.toLowerCase().includes(query))
    })
  }, [summaryBookings, summarySearch])
  const summaryPageSize = 3
  const totalSummaryPages = Math.max(1, Math.ceil(filteredSummaryBookings.length / summaryPageSize))
  const safeSummaryPage = Math.min(summaryPage, totalSummaryPages)
  const pagedSummaryBookings = useMemo(() => {
    const start = (safeSummaryPage - 1) * summaryPageSize
    return filteredSummaryBookings.slice(start, start + summaryPageSize)
  }, [filteredSummaryBookings, safeSummaryPage])
  const nextUpcomingBookings = useMemo(() => {
    const now = Date.now()
    return sortBookingsByDateTime(bookings)
      .filter((booking) => new Date(`${bookingDateKey(booking.date)}T${booking.time}:00`).getTime() >= now)
  }, [bookings])
  const upcomingPageSize = 3
  const totalUpcomingPages = Math.max(1, Math.ceil(nextUpcomingBookings.length / upcomingPageSize))
  const safeUpcomingPage = Math.min(upcomingPage, totalUpcomingPages)
  const pagedUpcomingBookings = useMemo(() => {
    const start = (safeUpcomingPage - 1) * upcomingPageSize
    return nextUpcomingBookings.slice(start, start + upcomingPageSize)
  }, [nextUpcomingBookings, safeUpcomingPage])
  const monthLabel = calendarMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  const selectedDateIsPast = isPastCalendarDate(selectedDate)
  const selectedDateBookingClosed = !selectedDateIsPast && !selectedDateCanCreate
  const getBookingMeetLink = useCallback((booking: CalendarBooking | null) => {
    if (!booking || ["cancelled", "expired", "rescheduled"].includes(booking.status)) return null
    return booking.googleMeetLink || `https://meet.google.com/new#booking-${booking.id}`
  }, [])
  const activeMeetLink = getBookingMeetLink(activeBooking)
  const canOperate = mode === "demo" || mode === "superadmin"
  const compactModalActions = activeBooking?.status === "pending" || activeBooking?.status === "confirmed"
  const getBookingActions = useCallback((booking: CalendarBooking | null) => {
    if (!booking) return []

    const bookingMeetLink = getBookingMeetLink(booking)

    const actions: Array<{
      key: CalendarActionType
      label: string
      variant: "default" | "accent" | "destructive"
      icon: typeof Check
      spinnerVariant: "primary" | "accent" | "destructive"
      disabled?: boolean
    }> = []

    if (canOperate && booking.status !== "confirmed" && booking.status !== "expired" && booking.status !== "rescheduled") {
      actions.push({
        key: "confirm",
        label: booking.status === "cancelled" ? "Reactivar" : "Aceptar",
        variant: "default",
        icon: Check,
        spinnerVariant: "primary",
        disabled: updatingId === booking.id,
      })
    }

    if (canOperate) {
      actions.push({
        key: "reschedule",
        label: "Reagendar",
        variant: "accent",
        icon: CalendarCheck2,
        spinnerVariant: "accent",
        disabled: updatingId === booking.id,
      })
    }

    if (canOperate && booking.status !== "cancelled" && booking.status !== "expired" && booking.status !== "rescheduled") {
      actions.push({
        key: "cancel",
        label: "Cancelar",
        variant: "destructive",
        icon: X,
        spinnerVariant: "destructive",
        disabled: updatingId === booking.id,
      })
    }

    if (bookingMeetLink) {
      actions.push({
        key: "meet",
        label: "Abrir Meet",
        variant: "default",
        icon: Video,
        spinnerVariant: "primary",
      })
    }

    if (canOperate) {
      actions.push({
        key: "delete",
        label: "Borrar",
        variant: "destructive",
        icon: Trash2,
        spinnerVariant: "destructive",
        disabled: updatingId === booking.id,
      })
    }

    return actions
  }, [canOperate, getBookingMeetLink, updatingId])
  const modalActions = useMemo(() => getBookingActions(activeBooking), [activeBooking, getBookingActions])
  const summaryDetailMeetLink = getBookingMeetLink(summaryDetailBooking)
  const summaryDetailActions = useMemo(() => getBookingActions(summaryDetailBooking), [getBookingActions, summaryDetailBooking])
  const summaryDetailCompactActions =
    summaryDetailBooking?.status === "pending" || summaryDetailBooking?.status === "confirmed"

  useEffect(() => {
    setDayPage(1)
  }, [selectedKey])

  useEffect(() => {
    if (dayPage > totalDayPages) {
      setDayPage(totalDayPages)
    }
  }, [dayPage, totalDayPages])

  useEffect(() => {
    if (upcomingPage > totalUpcomingPages) {
      setUpcomingPage(totalUpcomingPages)
    }
  }, [totalUpcomingPages, upcomingPage])

  useEffect(() => {
    setSummaryPage(1)
  }, [summaryFilter, calendarMonth, summarySearch])

  useEffect(() => {
    if (!summaryModalOpen) {
      setSummaryModalLoading(null)
      return
    }

    setSummaryModalLoading("search")
    const timeoutId = window.setTimeout(() => {
      setSummaryModalLoading((current) => (current === "search" ? null : current))
    }, 220)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [summaryModalOpen, summarySearch])

  useEffect(() => {
    if (summaryPage > totalSummaryPages) {
      setSummaryPage(totalSummaryPages)
    }
  }, [summaryPage, totalSummaryPages])

  const changeDayPageWithLoader = useCallback((direction: "prev" | "next") => {
    if (dayPageLoading) return
    if (direction === "prev" && safeDayPage <= 1) return
    if (direction === "next" && safeDayPage >= totalDayPages) return
    setDayPageLoading(direction)
    window.setTimeout(() => {
      setDayPage((current) =>
        direction === "prev" ? Math.max(1, current - 1) : Math.min(totalDayPages, current + 1)
      )
      setDayPageLoading(null)
    }, 500)
  }, [dayPageLoading, safeDayPage, totalDayPages])

  const selectDateWithLoader = useCallback((date: Date) => {
    if (dayPageLoading === "date") return
    setDayPageLoading("date")
    window.setTimeout(() => {
      setSelectedDate(date)
      setCalendarMonth(date)
      setDayPageLoading(null)
    }, 350)
  }, [dayPageLoading])

  const loadAvailability = useCallback(async (date: Date) => {
    const res = await fetch(`/api/availability?date=${encodeURIComponent(date.toISOString().slice(0, 10))}`, { cache: "no-store" })
    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || "No se pudieron cargar los horarios")
    }
    const data = await res.json()
    return { slots: data.slots || [], unavailable: data.unavailable || [] }
  }, [])

  useEffect(() => {
    if (!canOperate) return
    if (isPastCalendarDate(selectedDate)) {
      setSelectedDateCanCreate(false)
      return
    }

    let mounted = true

    const run = async () => {
      try {
        const availability = await loadAvailability(selectedDate)
        if (!mounted) return
        const canCreate = availability.slots.some(
          (slot: string) => !availability.unavailable.includes(slot) && !isPastTimeSlot(selectedDate, slot)
        )
        setSelectedDateCanCreate(canCreate)
      } catch {
        if (mounted) setSelectedDateCanCreate(true)
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [canOperate, loadAvailability, selectedDate])

  const changeUpcomingPageWithLoader = useCallback((direction: "prev" | "next") => {
    if (upcomingPageLoading) return
    if (direction === "prev" && safeUpcomingPage <= 1) return
    if (direction === "next" && safeUpcomingPage >= totalUpcomingPages) return
    setUpcomingPageLoading(direction)
    window.setTimeout(() => {
      setUpcomingPage((current) =>
        direction === "prev" ? Math.max(1, current - 1) : Math.min(totalUpcomingPages, current + 1)
      )
      setUpcomingPageLoading(null)
    }, 500)
  }, [safeUpcomingPage, totalUpcomingPages, upcomingPageLoading])

  const changeSummaryPageWithLoader = useCallback((direction: "prev" | "next") => {
    if (summaryModalLoading) return
    if (direction === "prev" && safeSummaryPage <= 1) return
    if (direction === "next" && safeSummaryPage >= totalSummaryPages) return
    setSummaryModalLoading(direction)
    window.setTimeout(() => {
      setSummaryPage((current) =>
        direction === "prev" ? Math.max(1, current - 1) : Math.min(totalSummaryPages, current + 1)
      )
      setSummaryModalLoading(null)
    }, 350)
  }, [safeSummaryPage, summaryModalLoading, totalSummaryPages])

  const openCreateDialog = useCallback((date: Date) => {
    if (!canOperate) return
    setSelectedDate(date)
    setCalendarMonth(date)
    setCreateDate(date)
    setCreateOpen(true)
  }, [canOperate])

  const openMobileDayAgenda = useCallback((date: Date) => {
    setSelectedDate(date)
    setCalendarMonth(date)
    setMobileDayAgendaOpen(true)
  }, [])

  const DayButton = useCallback(({ day, modifiers, className, ...props }: DayButtonProps) => {
    const key = dateKey(day.date)
    const counts = bookingStatusCountsByDate[key] ?? { pending: 0, confirmed: 0, cancelled: 0, expired: 0, rescheduled: 0 }
    const hasBookings = counts.pending + counts.confirmed + counts.cancelled + counts.expired > 0
    const blockedEmptyPastDay = !hasBookings && isPastCalendarDate(day.date)
    const badges = [
      counts.confirmed > 0
        ? { label: counts.confirmed, className: "border-primary/40 bg-primary/15 text-primary" }
        : null,
      counts.pending > 0
        ? { label: counts.pending, className: "border-warning/40 bg-warning/15 text-warning" }
        : null,
      counts.cancelled > 0
        ? { label: counts.cancelled, className: "border-secondary/40 bg-secondary/15 text-secondary" }
        : null,
      counts.expired > 0
        ? { label: counts.expired, className: "border-destructive/40 bg-destructive/15 text-destructive" }
        : null,
      counts.rescheduled > 0
        ? { label: counts.rescheduled, className: "border-accent bg-[rgba(var(--accent-rgb),0.32)] text-[hsl(var(--accent))]" }
        : null,
    ].filter(Boolean) as Array<{ label: number; className: string }>

    return (
      <button
        {...props}
        disabled={props.disabled || blockedEmptyPastDay}
        className={cn(
          className,
          modifiers.outside ? "" : blockedEmptyPastDay ? "cursor-not-allowed opacity-35" : "cursor-pointer"
        )}
        onClick={(event) => {
          props.onClick?.(event)
          if (event.defaultPrevented || modifiers.outside || blockedEmptyPastDay || !canOperate) return
          if (isMobileViewport) {
            openMobileDayAgenda(day.date)
            return
          }
          openCreateDialog(day.date)
        }}
      >
        <span className="flex h-full w-full flex-col items-center justify-between rounded-[inherit] px-1.5 py-1.5">
          <span className={modifiers.outside ? "text-muted-foreground/40" : ""}>{day.date.getDate()}</span>
          {badges.length > 0 ? (
            <span className="flex w-full flex-wrap justify-center gap-1">
              {badges.map((badge, index) => (
                <span
                  key={`${key}-badge-${index}`}
                  className={`flex h-[18px] basis-[calc(25%-0.1875rem)] items-center justify-center rounded-full border px-1 py-0.5 text-[9px] font-semibold leading-none md:h-[22px] ${badge.className}`}
                >
                  {badge.label}
                </span>
              ))}
            </span>
          ) : (
            <span className="h-[18px] md:h-[22px]" aria-hidden="true" />
          )}
        </span>
      </button>
    )
  }, [bookingStatusCountsByDate, canOperate, isMobileViewport, openCreateDialog, openMobileDayAgenda])

  const closeBookingDetailLayers = useCallback(() => {
    setConfirmAction(null)
    setActiveBooking(null)
    setSummaryDetailBooking(null)
    setSummaryModalOpen(false)
  }, [])

  const updateBookingStatus = useCallback(async (booking: CalendarBooking, status: "confirmed" | "cancelled") => {
    setUpdatingId(booking.id)
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", id: booking.id, status }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo actualizar la cita")
      }
      await load()
      closeBookingDetailLayers()
      sonnerToast.success(status === "confirmed" ? "Cita actualizada" : "Cita cancelada", {
        description: status === "confirmed" ? "La cita ha quedado confirmada." : "La cita ha quedado cancelada.",
      })
    } catch (error) {
      sonnerToast.error("No se pudo actualizar la cita", {
        description: error instanceof Error ? error.message : "No se pudo actualizar la cita",
      })
    } finally {
      setUpdatingId(null)
    }
  }, [closeBookingDetailLayers, load])

  const openRescheduleDialog = useCallback((booking: CalendarBooking) => {
    if (!booking.email?.trim()) {
      toast({
        variant: "destructive",
        title: "Correo obligatorio",
        description: "La cita debe tener un correo asociado para poder reagendarla.",
      })
      return
    }
    setActiveBooking(null)
    setRescheduleBooking(booking)
    setRescheduleOpen(true)
  }, [toast])

  const submitReschedule = useCallback(async (payload: BookingWizardSubmitPayload) => {
    if (!rescheduleBooking) {
      throw new Error("Selecciona una cita para reagendar")
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
          duration: 30,
        }),
      })
      if (!res.ok) {
        const responsePayload = await res.json().catch(() => null)
        throw new Error(responsePayload?.error || "No se pudo reagendar la cita")
      }
      await load()
      setRescheduleOpen(false)
      setRescheduleBooking(null)
      closeBookingDetailLayers()
      sonnerToast.success("Cita reagendada", {
        description: "La cita se ha reagendado correctamente.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo reagendar la cita"
      sonnerToast.error("No se pudo reagendar la cita", {
        description: message,
      })
      throw new Error(message)
    } finally {
      setUpdatingId(null)
    }
  }, [closeBookingDetailLayers, load, rescheduleBooking])

  const submitCreate = useCallback(async (payload: BookingWizardSubmitPayload) => {
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

      await load()
      setCreateOpen(false)
      setCreateEmail("")
      setCreateDate(null)
      sonnerToast.success("Cita creada", {
        description: "La nueva cita se ha creado y enviado correctamente.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear la cita"
      sonnerToast.error("No se pudo crear la cita", {
        description: message,
      })
      throw new Error(message)
    } finally {
      setUpdatingId(null)
    }
  }, [createEmail, load, toast])

  const deleteBooking = useCallback(async (booking: CalendarBooking) => {
    setUpdatingId(booking.id)
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: booking.id }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo borrar la cita")
      }
      const payload = await res.json().catch(() => null)
      await load()
      closeBookingDetailLayers()
      sonnerToast.success("Cita eliminada", {
        description:
          payload?.booking?.status === "deleted"
            ? "La cita se ha eliminado correctamente del sistema."
            : "La cita se ha eliminado correctamente.",
      })
    } catch (error) {
      sonnerToast.error("No se pudo borrar la cita", {
        description: error instanceof Error ? error.message : "No se pudo borrar la cita",
      })
    } finally {
      setUpdatingId(null)
    }
  }, [closeBookingDetailLayers, load])

  const confirmActionTitle =
    confirmAction === "confirm"
      ? activeBooking?.status === "cancelled"
        ? "Reactivar cita"
        : "Aceptar cita"
      : confirmAction === "cancel"
        ? "Cancelar cita"
        : confirmAction === "reschedule"
          ? "Reagendar cita"
          : confirmAction === "meet"
            ? "Abrir Google Meet"
            : confirmAction === "delete"
              ? "Eliminar cita"
            : ""

  const confirmActionDescription =
    confirmAction === "confirm"
      ? "Se actualizará el estado de la cita y se notificará según el flujo configurado."
      : confirmAction === "cancel"
        ? "La cita pasará a cancelada."
        : confirmAction === "reschedule"
          ? "Abrirás el flujo para seleccionar una nueva fecha y hora. Al confirmar, se enviará al cliente y a info@clinvetia.com con el nuevo enlace de Meet."
          : confirmAction === "meet"
            ? "Se abrirá el enlace de videollamada asociado a esta cita."
            : confirmAction === "delete"
              ? activeBooking && ["pending", "confirmed"].includes(activeBooking.status)
                ? "La cita sigue activa. Si continúas, se cancelará para notificar al cliente y después se eliminará del sistema."
                : "La cita se eliminará definitivamente."
            : ""

  const executeConfirmedAction = useCallback(async () => {
    if (!activeBooking || !confirmAction) return

    const action = confirmAction
    setConfirmAction(null)

    if (action === "confirm") {
      await updateBookingStatus(activeBooking, "confirmed")
      return
    }
    if (action === "cancel") {
      await updateBookingStatus(activeBooking, "cancelled")
      return
    }
    if (action === "reschedule") {
      openRescheduleDialog(activeBooking)
      return
    }
    if (action === "delete") {
      await deleteBooking(activeBooking)
      return
    }
    if (action === "meet" && activeMeetLink) {
      window.open(activeMeetLink, "_blank", "noopener,noreferrer")
    }
  }, [activeBooking, activeMeetLink, confirmAction, deleteBooking, openRescheduleDialog, updateBookingStatus])

  return (
    <div className="space-y-7">
      <Dialog
        open={summaryModalOpen}
        onOpenChange={(open) => {
          setSummaryModalOpen(open)
          if (!open) {
            setSummaryFilter("month")
            setSummarySearch("")
            setSummaryDetailBooking(null)
            setActiveBooking(null)
          }
        }}
      >
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 sm:max-h-[85vh] sm:max-w-2xl [&>button]:hidden">
          <div
            className={cn(
              "shrink-0 border-b border-white/8 px-4 pb-4 pt-5 md:px-6 md:pt-6",
              summaryDetailBooking ? "space-y-3" : "space-y-4",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <DialogHeader className="pr-2">
                <DialogTitle>{summaryDetailBooking ? "Resumen de la cita" : summaryFilterLabel(summaryFilter)}</DialogTitle>
                <DialogDescription>
                  {summaryDetailBooking
                    ? "Detalle operativo de la reserva seleccionada."
                    : `Listado completo de citas de ${summaryFilterLabel(summaryFilter).toLowerCase()} en ${monthLabel}.`}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                {summaryDetailBooking ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full"
                    onClick={() => {
                      setSummaryDetailBooking(null)
                      setActiveBooking(null)
                    }}
                  >
                    <Icon icon={ArrowLeft} size="sm" />
                  </Button>
                ) : null}
                <DialogClose asChild>
                  <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full">
                    <Icon icon={X} size="sm" />
                  </Button>
                </DialogClose>
              </div>
            </div>

            <div className={cn("space-y-2 transition-all duration-300", summaryDetailBooking ? "hidden" : "block")}>
              <label htmlFor="calendar-summary-search" className="text-sm font-medium">
                Buscar cita por cliente
              </label>
              <div className="relative">
                <Input
                  id="calendar-summary-search"
                  type="text"
                  value={summarySearch}
                  onChange={(event) => setSummarySearch(event.target.value)}
                  placeholder="Cliente, email, fecha, hora o ID"
                  className="pr-10"
                />
                {summaryModalLoading === "search" && (
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <Spinner size="sm" variant="accent" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={cn("min-h-0 flex-1 overflow-y-auto", summaryDetailBooking && "overflow-clip")}>
            <div className={cn("relative overflow-clip px-4 md:px-6", summaryDetailBooking ? "py-3" : "py-4")}>
              <div
                className={cn(
                  "space-y-3 transition-all duration-300 ease-out",
                  summaryDetailBooking
                    ? "pointer-events-none absolute inset-0 -translate-x-10 opacity-0"
                    : "relative translate-x-0 opacity-100"
                )}
              >
                {pagedSummaryBookings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-background/40 px-4 py-6 text-sm text-muted-foreground">
                    {summarySearch.trim()
                      ? "No hay citas que coincidan con esta búsqueda."
                      : "No hay citas en esta categoría para este mes."}
                  </div>
                ) : (
                  pagedSummaryBookings.map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => {
                        setSelectedDate(new Date(booking.date))
                        setCalendarMonth(new Date(booking.date))
                        setSummaryDetailBooking(booking)
                        setActiveBooking(booking)
                      }}
                      className={bookingCardClass(booking.status)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">
                            {new Date(booking.date).toLocaleDateString("es-ES", { day: "numeric", month: "long" })} · {booking.time} · {booking.duration} min
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">ID {booking.id}</div>
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
                    </button>
                  ))
                )}
              </div>

              <div
                className={cn(
                  "transition-all duration-300 ease-out",
                  summaryDetailBooking
                    ? "relative translate-x-0 opacity-100"
                    : "pointer-events-none absolute inset-0 translate-x-10 opacity-0"
                )}
              >
                {summaryDetailBooking ? (
                  <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <div className="text-sm font-semibold">
                        {new Date(summaryDetailBooking.date).toLocaleDateString("es-ES", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}{" "}
                        · {summaryDetailBooking.time}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{summaryDetailBooking.duration} min</div>
                      <div className="mt-1 text-xs font-medium text-muted-foreground">
                        ID {summaryDetailBooking.id}
                      </div>
                    </div>
                    <Badge variant={statusBadgeVariant(summaryDetailBooking.status)}>
                      {statusLabel(summaryDetailBooking.status)}
                    </Badge>
                  </div>

                  <div className={cn("grid gap-3", summaryDetailMeetLink ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
                    <div className="rounded-xl border border-white/10 bg-background/45 p-4">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Cliente</div>
                      <div className="mt-2 text-sm font-medium">
                        {summaryDetailBooking.nombre || "Sin nombre"}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">ID {summaryDetailBooking.id}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {summaryDetailBooking.clinica || "Sin clínica"}
                      </div>
                      <div className="mt-1 break-all text-xs text-muted-foreground">
                        {summaryDetailBooking.email || "Sin email"}
                      </div>
                    </div>

                    {summaryDetailMeetLink ? (
                      <div className="rounded-xl border border-white/10 bg-background/45 p-4">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Videollamada</div>
                        <div className="mt-2 text-sm font-medium">Google Meet</div>
                        <a
                          href={summaryDetailMeetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block break-all text-xs text-primary underline-offset-2 hover:underline"
                        >
                          {summaryDetailMeetLink}
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-background/45 p-4">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <Icon icon={MessageCircle} size="xs" variant="primary" />
                      <span>Conversación con Moka</span>
                    </div>
                    {summaryDetailBooking.conversationMessages && summaryDetailBooking.conversationMessages.length > 0 ? (
                      <div className="mt-3 space-y-3">
                        {summaryDetailBooking.conversationSummary ? (
                          <div className="rounded-xl border border-white/10 bg-background/50 px-3 py-3 text-sm text-muted-foreground whitespace-pre-wrap">
                            {summaryDetailBooking.conversationSummary}
                          </div>
                        ) : null}
                        {summaryDetailBooking.conversationMessages.map((message, index) => (
                          <div
                            key={`${summaryDetailBooking.id}-message-${index}`}
                            className="rounded-xl border border-white/10 bg-background/50 px-3 py-3"
                          >
                            <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                              <span>{message.role === "assistant" ? "Moka" : "Usuario"}</span>
                              <span>{new Date(message.timestamp).toLocaleString("es-ES")}</span>
                            </div>
                            <div className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">{message.content}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-background/50 px-3 py-3 text-sm text-muted-foreground">
                        No ha habido conversación con Moka en esta reserva.
                      </div>
                    )}
                  </div>

                  {summaryDetailActions.length > 0 && (
                    <DialogFooter
                      className="grid gap-2 overflow-visible border-t-0 px-1 pb-1 pt-0"
                      style={{ gridTemplateColumns: `repeat(${summaryDetailActions.length}, minmax(0, 1fr))` }}
                    >
                      {summaryDetailActions.map((action) => (
                        <Popover key={action.key}>
                          <PopoverTrigger asChild>
                            <Button
                              variant={action.variant}
                              className={`w-full px-3 text-xs sm:text-sm ${summaryDetailCompactActions ? "gap-0" : "gap-2"}`}
                              disabled={Boolean(action.disabled)}
                              onClick={() => setConfirmAction(action.key)}
                              title={action.label}
                              aria-label={action.label}
                            >
                              {action.disabled ? (
                                <Spinner size="sm" variant={action.spinnerVariant} />
                              ) : (
                                <Icon icon={action.icon} size="sm" />
                              )}
                              {!summaryDetailCompactActions && <span className="truncate">{action.label}</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent side="top" className="px-3 py-2 text-xs font-medium">
                            {action.label}
                          </PopoverContent>
                        </Popover>
                      ))}
                    </DialogFooter>
                  )}
                  </div>
                ) : null}
              </div>
              {summaryModalLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl border border-white/10 bg-background/60 backdrop-blur-sm">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner size="sm" variant="accent" />
                    Cargando citas...
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className={cn(
            "shrink-0 items-center justify-between gap-3 border-t border-white/8 px-4 pb-4 pt-4 md:px-6 md:pb-6 sm:justify-between sm:[&>*]:flex-none",
            summaryDetailBooking ? "m-0 h-0 overflow-hidden border-t-0 p-0 opacity-0" : "opacity-100"
          )}>
            <div className="text-xs text-muted-foreground">
              Página {safeSummaryPage} de {totalSummaryPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-auto border-white/15 bg-background/75 text-foreground shadow-[0_0_16px_rgba(var(--black-rgb),0.16)] hover:bg-primary/10 hover:text-foreground dark:border-white/15 dark:bg-background/80 dark:text-foreground"
                disabled={safeSummaryPage <= 1 || summaryModalLoading !== null}
                onClick={() => changeSummaryPageWithLoader("prev")}
              >
                {summaryModalLoading === "prev" ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" variant="accent" />
                    Cargando...
                  </span>
                ) : "Anterior"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-auto border-white/15 bg-background/75 text-foreground shadow-[0_0_16px_rgba(var(--black-rgb),0.16)] hover:bg-primary/10 hover:text-foreground dark:border-white/15 dark:bg-background/80 dark:text-foreground"
                disabled={safeSummaryPage >= totalSummaryPages || summaryModalLoading !== null}
                onClick={() => changeSummaryPageWithLoader("next")}
              >
                {summaryModalLoading === "next" ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" variant="accent" />
                    Cargando...
                  </span>
                ) : "Siguiente"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(confirmAction)} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmActionTitle}</DialogTitle>
            <DialogDescription>{confirmActionDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="w-full sm:flex-1" onClick={() => setConfirmAction(null)}>
              Volver
            </Button>
            <Button
              variant={
                confirmAction === "cancel"
                  ? "secondary"
                  : confirmAction === "delete"
                    ? "destructive"
                    : "default"
              }
              className="w-full sm:flex-1"
              onClick={executeConfirmedAction}
            >
              Confirmar
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
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reagendar cita</DialogTitle>
            <DialogDescription>
              Selecciona una nueva fecha y hora. La cita se enviará al correo ya asociado.
            </DialogDescription>
          </DialogHeader>
          {rescheduleBooking && (
            <div className="rounded-xl border border-white/10 bg-background/45 px-4 py-3 text-sm text-muted-foreground">
              Reagendando para{" "}
              <span className="font-medium text-foreground">
                {rescheduleBooking.nombre || rescheduleBooking.email || "cliente sin identificar"}
              </span>
            </div>
          )}
          {rescheduleBooking && (
            <BookingWizard
              className="border-white/10 bg-transparent p-0 shadow-none"
              title="Reagendar cita"
              subtitle="Elige un nuevo día y una nueva hora"
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
              loadAvailability={loadAvailability}
              onSubmit={submitReschedule}
            />
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRescheduleOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) {
            setCreateEmail("")
            setCreateDate(null)
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva cita</DialogTitle>
            <DialogDescription>
              Selecciona la hora y completa el correo para enviar la nueva cita.
            </DialogDescription>
          </DialogHeader>
          <BookingWizard
            className="border-white/10 bg-transparent p-0 shadow-none"
            title="Añadir cita"
            subtitle="Elige la hora disponible y confirma el correo del cliente"
            confirmCtaLabel="Crear cita"
            confirmingLabel="Creando..."
            showDurationSelector={false}
            initialDate={createDate}
            initialDuration={30}
            initialStep="time"
            confirmContent={
              <div className="space-y-2">
                <label htmlFor="calendar-create-booking-email" className="text-sm font-medium">
                  Correo del cliente
                </label>
                <Input
                  id="calendar-create-booking-email"
                  type="email"
                  value={createEmail}
                  onChange={(event) => setCreateEmail(event.target.value)}
                  placeholder="cliente@clinica.com"
                  required
                />
              </div>
            }
            canSubmit={Boolean(createEmail.trim())}
            loadAvailability={loadAvailability}
            onSubmit={submitCreate}
          />

          <DialogFooter className="sm:[&>*]:flex-none">
            <Button variant="ghost" onClick={() => setCreateOpen(false)} className="w-auto">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activeBooking) && !summaryModalOpen} onOpenChange={(open) => !open && setActiveBooking(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resumen de la cita</DialogTitle>
            <DialogDescription>
              Detalle operativo de la reserva seleccionada.
            </DialogDescription>
          </DialogHeader>

          {activeBooking && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <div className="text-sm font-semibold">
                    {new Date(activeBooking.date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    · {activeBooking.time}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{activeBooking.duration} min</div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground">
                    ID {activeBooking.id}
                  </div>
                </div>
                <Badge variant={statusBadgeVariant(activeBooking.status)}>{statusLabel(activeBooking.status)}</Badge>
              </div>

              <div className={cn("grid gap-3", activeMeetLink ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
                <div className="rounded-xl border border-white/10 bg-background/45 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Cliente</div>
                  <div className="mt-2 text-sm font-medium">
                    {activeBooking.nombre || "Sin nombre"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">ID {activeBooking.id}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {activeBooking.clinica || "Sin clínica"}
                  </div>
                  <div className="mt-1 break-all text-xs text-muted-foreground">
                    {activeBooking.email || "Sin email"}
                  </div>
                </div>

                {activeMeetLink ? (
                  <div className="rounded-xl border border-white/10 bg-background/45 p-4">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Videollamada</div>
                    <div className="mt-2 text-sm font-medium">Google Meet</div>
                    <a
                      href={activeMeetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-xs text-primary underline-offset-2 hover:underline"
                    >
                      {activeMeetLink}
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border border-white/10 bg-background/45 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <Icon icon={MessageCircle} size="xs" variant="primary" />
                  <span>Conversación con Moka</span>
                </div>
                {activeBooking.conversationMessages && activeBooking.conversationMessages.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {activeBooking.conversationSummary ? (
                      <div className="rounded-xl border border-white/10 bg-background/55 px-3 py-3 text-sm text-muted-foreground whitespace-pre-wrap">
                        {activeBooking.conversationSummary}
                      </div>
                    ) : null}
                    {activeBooking.conversationMessages.map((message, index) => (
                      <div
                        key={`${activeBooking.id}-message-${index}`}
                        className="rounded-xl border border-white/10 bg-background/55 px-3 py-3"
                      >
                        <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                          <span>{message.role === "assistant" ? "Moka" : "Usuario"}</span>
                          <span>{new Date(message.timestamp).toLocaleString("es-ES")}</span>
                        </div>
                        <div className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">{message.content}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-background/55 px-3 py-3 text-sm text-muted-foreground">
                    No ha habido conversación con Moka en esta reserva.
                  </div>
                )}
              </div>
            </div>
          )}

          {modalActions.length > 0 && (
            <DialogFooter
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${modalActions.length}, minmax(0, 1fr))` }}
            >
              {modalActions.map((action) => (
                <Popover key={action.key}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={action.variant}
                      className={cn(
                        "w-full px-3 text-xs sm:text-sm",
                        compactModalActions ? "gap-0" : "gap-2",
                        action.variant === "default" && "bg-primary/18 text-primary border-primary/80 shadow-[0_0_22px_rgba(var(--primary-rgb),0.32)] dark:bg-primary/16 dark:text-primary dark:border-primary/85",
                        action.variant === "accent" && "bg-accent/18 text-accent border-accent/85 shadow-[0_0_22px_rgba(var(--accent-rgb),0.32)] dark:bg-accent/16 dark:text-accent dark:border-accent/90",
                        action.variant === "destructive" && "bg-destructive/16 text-destructive border-destructive/80 shadow-[0_0_22px_rgba(var(--destructive-rgb),0.26)] dark:bg-destructive/14 dark:text-destructive dark:border-destructive/85",
                      )}
                      disabled={Boolean(action.disabled)}
                      onClick={() => setConfirmAction(action.key)}
                      title={action.label}
                      aria-label={action.label}
                    >
                      {action.disabled ? (
                        <Spinner size="sm" variant={action.spinnerVariant} />
                      ) : (
                        <Icon
                          icon={action.icon}
                          size="sm"
                          variant="default"
                          className={cn(
                            action.variant === "default" && "text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.45)]",
                            action.variant === "accent" && "text-[rgb(var(--white-rgb))] drop-shadow-[0_0_10px_rgba(var(--accent-rgb),0.6)]",
                            action.variant === "destructive" && "text-destructive drop-shadow-[0_0_8px_rgba(var(--destructive-rgb),0.45)]",
                          )}
                        />
                      )}
                      {!compactModalActions && <span className="truncate">{action.label}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="px-3 py-2 text-xs font-medium">
                    {action.label}
                  </PopoverContent>
                </Popover>
              ))}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={mobileDayAgendaOpen} onOpenChange={setMobileDayAgendaOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Agenda del día</DialogTitle>
            <DialogDescription>
              {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-1 space-y-3">
            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner size="sm" variant="primary" />
                <span>Cargando agenda...</span>
              </div>
            )}
            {!loading && canOperate && (
              <button
                type="button"
                disabled={selectedDateIsPast || selectedDateBookingClosed}
                onClick={() => {
                  setMobileDayAgendaOpen(false)
                  openCreateDialog(selectedDate)
                }}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition-all",
                  selectedDateIsPast || selectedDateBookingClosed
                    ? "cursor-not-allowed border-border/70 bg-background/40 text-muted-foreground opacity-55"
                    : "cursor-pointer border-accent/65 bg-[rgba(var(--accent-rgb),0.16)] shadow-[0_0_24px_rgba(var(--accent-rgb),0.18)] hover:border-accent/85 hover:bg-[rgba(var(--accent-rgb),0.22)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        selectedDateIsPast || selectedDateBookingClosed
                          ? "text-muted-foreground"
                          : "text-foreground drop-shadow-[0_0_10px_rgba(var(--accent-rgb),0.35)]"
                      )}
                    >
                      Añadir cita
                    </div>
                    <div className={cn("mt-1 text-sm", selectedDateIsPast || selectedDateBookingClosed ? "text-muted-foreground" : "text-foreground/80")}>
                      {selectedDateIsPast
                        ? "No se pueden crear citas en días pasados."
                        : selectedDateBookingClosed
                          ? "Ya no se puede reservar para este día."
                          : "Crear una nueva cita en este día."}
                    </div>
                  </div>
                  <Badge variant={selectedDateIsPast || selectedDateBookingClosed ? "outline" : "accent"}>
                    {selectedDateBookingClosed ? "Cerrado" : "Nuevo"}
                  </Badge>
                </div>
              </button>
            )}
            {!loading && selectedDayBookings.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 bg-background/40 px-4 py-6 text-sm text-muted-foreground">
                No hay citas programadas para este día.
              </div>
            )}
            {!loading && pagedSelectedDayBookings.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => {
                  setMobileDayAgendaOpen(false)
                  setActiveBooking(booking)
                }}
                className={bookingCardClass(booking.status)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{booking.time} · {booking.duration} min</div>
                    <div className="mt-1 text-xs text-muted-foreground">ID {booking.id}</div>
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
              </button>
            ))}
            {dayPageLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl border border-white/10 bg-background/55 backdrop-blur-sm">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner size="sm" variant="primary" />
                  Cargando citas...
                </div>
              </div>
            )}
          </div>

          {!loading && selectedDayBookings.length > dayPageSize && (
            <DialogFooter className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Página {safeDayPage} de {totalDayPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-auto border-white/15 bg-background/75 text-foreground shadow-[0_0_16px_rgba(var(--black-rgb),0.16)] hover:bg-primary/10 hover:text-foreground dark:border-white/15 dark:bg-background/80 dark:text-foreground"
                  disabled={safeDayPage <= 1 || dayPageLoading !== null}
                  onClick={() => changeDayPageWithLoader("prev")}
                >
                  {dayPageLoading === "prev" ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size="sm" variant="primary" />
                      Cargando...
                    </span>
                  ) : "Anterior"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-auto border-white/15 bg-background/75 text-foreground shadow-[0_0_16px_rgba(var(--black-rgb),0.16)] hover:bg-primary/10 hover:text-foreground dark:border-white/15 dark:bg-background/80 dark:text-foreground"
                  disabled={safeDayPage >= totalDayPages || dayPageLoading !== null}
                  onClick={() => changeDayPageWithLoader("next")}
                >
                  {dayPageLoading === "next" ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size="sm" variant="primary" />
                      Cargando...
                    </span>
                  ) : "Siguiente"}
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

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

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <GlassCard className="h-fit min-w-0 self-start p-4 sm:p-5">
          <Calendar
            mode="single"
            month={calendarMonth}
            selected={selectedDate}
            onMonthChange={setCalendarMonth}
            onSelect={(date) => {
              if (!date) return
              selectDateWithLoader(date)
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
                "min-h-14 h-auto w-full cursor-pointer rounded-2xl border border-border/80 bg-background/55 p-0 text-sm font-medium text-foreground shadow-none transition-all hover:border-[rgba(var(--primary-rgb),0.45)] hover:bg-primary/10 hover:text-primary md:min-h-16 md:h-auto",
              selected:
                "[&>button]:border-[rgba(var(--primary-rgb),0.8)] [&>button]:bg-primary/20 [&>button]:text-primary [&>button]:shadow-[0_0_24px_rgba(var(--primary-rgb),0.24)]",
              today: "[&>button]:border-[rgba(var(--accent-rgb),0.45)] [&>button]:bg-accent/10",
              outside: "opacity-60",
            }}
            components={{ DayButton }}
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            <button
              type="button"
              onClick={() => {
                setSummaryFilter("month")
                setSummaryModalOpen(false)
              }}
              className={cn(
                "min-w-0 cursor-pointer rounded-xl border px-3 py-2 text-left transition-all",
                summaryFilter === "month"
                  ? "border-border bg-background/80 shadow-[0_0_20px_rgba(var(--foreground-rgb),0.08)]"
                  : "border-border/80 bg-background/50 hover:border-border hover:bg-background/70"
              )}
            >
              <HoverPopoverLabel label="Mes" className="text-[11px] uppercase tracking-wider text-muted-foreground" />
              <div className="mt-1 text-lg font-semibold">{monthSummary.total}</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setSummaryFilter("confirmed")
                setSummaryModalOpen(true)
              }}
              className={cn(
                "min-w-0 cursor-pointer rounded-xl border px-3 py-2 text-left transition-all",
                summaryFilter === "confirmed" && summaryModalOpen
                  ? "border-primary/45 bg-primary/12 shadow-[0_0_22px_rgba(var(--primary-rgb),0.16)]"
                  : "border-primary/20 bg-primary/5 hover:border-primary/35 hover:bg-primary/10"
              )}
            >
              <HoverPopoverLabel label="Confirmadas" className="text-[11px] uppercase tracking-wider text-primary" />
              <div className="mt-1 text-lg font-semibold text-primary">{monthSummary.confirmed}</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setSummaryFilter("pending")
                setSummaryModalOpen(true)
              }}
              className={cn(
                "min-w-0 cursor-pointer rounded-xl border px-3 py-2 text-left transition-all",
                summaryFilter === "pending" && summaryModalOpen
                  ? "border-warning/45 bg-warning/12 shadow-[0_0_22px_rgba(var(--warning-rgb),0.16)]"
                  : "border-warning/20 bg-warning/5 hover:border-warning/35 hover:bg-warning/10"
              )}
            >
              <HoverPopoverLabel label="Pendientes" className="text-[11px] uppercase tracking-wider text-warning" />
              <div className="mt-1 text-lg font-semibold text-warning">{monthSummary.pending}</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setSummaryFilter("cancelled")
                setSummaryModalOpen(true)
              }}
              className={cn(
                "min-w-0 cursor-pointer rounded-xl border px-3 py-2 text-left transition-all",
                summaryFilter === "cancelled" && summaryModalOpen
                  ? "border-secondary/45 bg-secondary/12 shadow-[0_0_22px_rgba(var(--secondary-rgb),0.16)]"
                  : "border-secondary/20 bg-secondary/5 hover:border-secondary/35 hover:bg-secondary/10"
              )}
            >
              <HoverPopoverLabel label="Canceladas" className="text-[11px] uppercase tracking-wider text-secondary" />
              <div className="mt-1 text-lg font-semibold text-secondary">{monthSummary.cancelled}</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setSummaryFilter("rescheduled")
                setSummaryModalOpen(true)
              }}
              className={cn(
                "min-w-0 cursor-pointer rounded-xl border px-3 py-2 text-left transition-all",
                summaryFilter === "rescheduled" && summaryModalOpen
                  ? "border-accent bg-[rgba(var(--accent-rgb),0.34)] shadow-[0_0_28px_rgba(var(--accent-rgb),0.28)]"
                  : "border-accent/90 bg-[rgba(var(--accent-rgb),0.28)] hover:border-accent hover:bg-[rgba(var(--accent-rgb),0.34)]"
              )}
            >
              <HoverPopoverLabel label="Reagendadas" className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--accent))]" />
              <div className="mt-1 text-lg font-semibold text-[hsl(var(--accent))]">{monthSummary.rescheduled}</div>
            </button>
          </div>
        </GlassCard>

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

          <div className="relative mt-4 space-y-3">
            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner size="sm" variant="primary" />
                <span>Cargando agenda...</span>
              </div>
            )}
            {!loading && canOperate && (
              <button
                type="button"
                disabled={selectedDateIsPast || selectedDateBookingClosed}
                onClick={() => openCreateDialog(selectedDate)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition-all",
                  selectedDateIsPast || selectedDateBookingClosed
                    ? "cursor-not-allowed border-border/70 bg-background/40 text-muted-foreground opacity-55"
                    : "cursor-pointer border-accent/65 bg-[rgba(var(--accent-rgb),0.16)] shadow-[0_0_24px_rgba(var(--accent-rgb),0.18)] hover:border-accent/85 hover:bg-[rgba(var(--accent-rgb),0.22)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                    <div>
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        selectedDateIsPast || selectedDateBookingClosed
                          ? "text-muted-foreground"
                          : "text-foreground drop-shadow-[0_0_10px_rgba(var(--accent-rgb),0.35)]"
                      )}
                    >
                      Añadir cita
                    </div>
                    <div className={cn("mt-1 text-sm", selectedDateIsPast || selectedDateBookingClosed ? "text-muted-foreground" : "text-foreground/80")}>
                      {selectedDateIsPast
                        ? "No se pueden crear citas en días pasados."
                        : selectedDateBookingClosed
                          ? "Ya no se puede reservar para este día."
                        : "Crear una nueva cita en este día."}
                    </div>
                  </div>
                  <Badge variant={selectedDateIsPast || selectedDateBookingClosed ? "outline" : "accent"}>
                    {selectedDateBookingClosed ? "Cerrado" : "Nuevo"}
                  </Badge>
                </div>
              </button>
            )}
            {!loading && selectedDayBookings.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 bg-background/40 px-4 py-6 text-sm text-muted-foreground">
                No hay citas programadas para este día.
              </div>
            )}
            {!loading && pagedSelectedDayBookings.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => setActiveBooking(booking)}
                className={bookingCardClass(booking.status)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{booking.time} · {booking.duration} min</div>
                    <div className="mt-1 text-xs text-muted-foreground">ID {booking.id}</div>
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
              </button>
            ))}
            {dayPageLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl border border-white/10 bg-background/55 backdrop-blur-sm">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner size="sm" variant="primary" />
                  Cargando citas...
                </div>
              </div>
            )}
          </div>

          {!loading && selectedDayBookings.length > dayPageSize && (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="text-xs text-muted-foreground">
                Página {safeDayPage} de {totalDayPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-auto border-white/15 bg-background/75 text-foreground shadow-[0_0_16px_rgba(var(--black-rgb),0.16)] hover:bg-primary/10 hover:text-foreground dark:border-white/15 dark:bg-background/80 dark:text-foreground"
                  disabled={safeDayPage <= 1 || dayPageLoading !== null}
                  onClick={() => changeDayPageWithLoader("prev")}
                >
                  {dayPageLoading === "prev" ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size="sm" variant="primary" />
                      Cargando...
                    </span>
                  ) : "Anterior"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-auto border-white/15 bg-background/75 text-foreground shadow-[0_0_16px_rgba(var(--black-rgb),0.16)] hover:bg-primary/10 hover:text-foreground dark:border-white/15 dark:bg-background/80 dark:text-foreground"
                  disabled={safeDayPage >= totalDayPages || dayPageLoading !== null}
                  onClick={() => changeDayPageWithLoader("next")}
                >
                  {dayPageLoading === "next" ? (
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

      <GlassCard className="min-w-0 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Próximas citas</div>
            <div className="mt-1 text-sm font-semibold">Siguientes pasos de agenda</div>
          </div>
          <Badge variant="accent">
            {nextUpcomingBookings.length} cita{nextUpcomingBookings.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="mt-4 space-y-4">
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
          {!loading && pagedUpcomingBookings.length > 0 && (
            <div className="relative">
              <div className="grid gap-4 md:grid-cols-3">
                {pagedUpcomingBookings.map((booking, index) => (
                  <div key={booking.id} className="relative">
                    {index < pagedUpcomingBookings.length - 1 && (
                      <div
                        className="absolute left-[calc(50%+1.5rem)] right-[-1rem] top-4 hidden h-px bg-white/10 md:block"
                        aria-hidden="true"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const nextDate = new Date(booking.date)
                        selectDateWithLoader(nextDate)
                        setActiveBooking(booking)
                      }}
                      className="group relative z-10 w-full cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-background/45 p-4 text-left transition-all hover:border-primary/45 hover:bg-primary/5"
                    >
                      <div className="absolute left-6 top-14 bottom-6 w-px bg-white/10 group-last:hidden md:hidden" aria-hidden="true" />
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                          {(safeUpcomingPage - 1) * upcomingPageSize + index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium">
                                {new Date(booking.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} · {booking.time}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">ID {booking.id}</div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {booking.nombre || booking.clinica || booking.email || "Sin contacto"}
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                {booking.duration} min
                              </div>
                            </div>
                            <Badge variant={statusBadgeVariant(booking.status)}>{statusLabel(booking.status)}</Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
              {upcomingPageLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl border border-white/10 bg-background/55 backdrop-blur-sm">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner size="sm" variant="accent" />
                    Cargando próximas citas...
                  </div>
                </div>
              )}
            </div>
          )}
          {!loading && nextUpcomingBookings.length > upcomingPageSize && (
            <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="text-xs text-muted-foreground">
                Página {safeUpcomingPage} de {totalUpcomingPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-auto border-white/15 bg-background/75 text-foreground shadow-[0_0_16px_rgba(var(--black-rgb),0.16)] hover:bg-primary/10 hover:text-foreground dark:border-white/15 dark:bg-background/80 dark:text-foreground"
                  disabled={safeUpcomingPage <= 1 || upcomingPageLoading !== null}
                  onClick={() => changeUpcomingPageWithLoader("prev")}
                >
                  {upcomingPageLoading === "prev" ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size="sm" variant="accent" />
                      Cargando...
                    </span>
                  ) : "Anterior"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-auto border-white/15 bg-background/75 text-foreground shadow-[0_0_16px_rgba(var(--black-rgb),0.16)] hover:bg-primary/10 hover:text-foreground dark:border-white/15 dark:bg-background/80 dark:text-foreground"
                  disabled={safeUpcomingPage >= totalUpcomingPages || upcomingPageLoading !== null}
                  onClick={() => changeUpcomingPageWithLoader("next")}
                >
                  {upcomingPageLoading === "next" ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size="sm" variant="accent" />
                      Cargando...
                    </span>
                  ) : "Siguiente"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
