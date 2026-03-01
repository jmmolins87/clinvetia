"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/GlassCard"
import { Avatar, AvatarGroup } from "@/components/ui/avatar"
import { BrandName } from "@/components/ui/brand-name"
import { Icon } from "@/components/ui/icon"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useROIStore } from "@/store/roi-store"
import { storage } from "@/lib/storage"
import { ApiError, createBooking, getActiveBookingBySession, getAvailability, getBooking } from "@/lib/api"
import { BookingWizard, type BookingWizardSubmitPayload } from "@/components/scheduling/BookingWizard"
import { getRecaptchaToken } from "@/lib/recaptcha-client"

// ── Datos ──────────────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { initials: "AM", variant: "primary" as const },
  { initials: "JL", variant: "secondary" as const },
  { initials: "PR", variant: "default" as const },
]

const WEEK_DAYS = ["L", "M", "X", "J", "V", "S", "D"]

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const DURATION_OPTIONS = [
  { label: "30m", value: 30 },
  { label: "45m", value: 45 },
  { label: "60m", value: 60 },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
}

function isWeekend(year: number, month: number, day: number) {
  const d = new Date(year, month, day).getDay()
  return d === 0 || d === 6
}

function isPast(year: number, month: number, day: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(year, month, day) < today
}

function isValidAccessToken(token: string | null) {
  if (!token) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
}

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

interface CalendarGridProps {
  year: number
  month: number
  selected: Date | null
  dayAvailability: Record<string, "available" | "unavailable">
  onSelect: (date: Date) => void
  onPrev: () => void
  onNext: () => void
}

function CalendarGrid({ year, month, selected, dayAvailability, onSelect, onPrev, onNext }: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = new Date()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          className="h-8 w-8 text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
          aria-label="Mes anterior"
        >
          <Icon icon={ChevronLeft} size="sm" />
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {MONTHS[month]} {year}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="h-8 w-8 text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
          aria-label="Mes siguiente"
        >
          <Icon icon={ChevronRight} size="sm" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="py-1.5 text-center text-base font-semibold uppercase tracking-wider text-muted-foreground">
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          if (!day) return         <div key={`empty-${i}`} />


          const date = new Date(year, month, day)
          const past = isPast(year, month, day)
          const weekend = isWeekend(year, month, day)
          const isToday = isSameDay(date, today)
          const isSelected = selected ? isSameDay(date, selected) : false
          const dateKey = formatLocalDateKey(date)
          const backendUnavailable = dayAvailability[dateKey] === "unavailable"
          const disabled = past || weekend || backendUnavailable
          const dayState: "available" | "unavailable" | "selected" = isSelected
            ? "selected"
            : disabled
              ? "unavailable"
              : "available"

          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={cn(
                "relative flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                disabled ? "cursor-not-allowed border border-white/10 bg-white/8 text-muted-foreground/70" : "cursor-pointer",
                !disabled && !isSelected && "hover:bg-primary/15 hover:text-primary",
                isToday && !isSelected && "border border-primary/40 text-primary",
                isSelected && "bg-primary text-primary-foreground shadow-[0_0_16px_rgba(var(--primary-rgb),0.5)]",
              )}
              aria-label={`${day} de ${MONTHS[month]}`}
              aria-pressed={isSelected}
            >
              {day}
              <span
                className={cn(
                  "absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                  dayState === "available" && "bg-primary/70 ring-1 ring-primary/70",
                  dayState === "selected" && "bg-primary ring-1 ring-primary",
                  dayState === "unavailable" && "bg-white/45 ring-1 ring-white/60",
                )}
              />
              {isToday && !isSelected && (
                <span className="absolute inset-0 rounded-lg ring-1 ring-primary/30" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}


interface TimeSlotPickerProps {
  date: Date | null
  slots: string[]
  unavailable: Set<string>
  selected: string | null
  onSelect: (slot: string) => void
}

function TimeSlotPicker({ date, slots, unavailable, selected, onSelect }: TimeSlotPickerProps) {
  const isPastTime = (slot: string) => {
    if (!date) return false
    const today = new Date()
    const isSameDate = date.toDateString() === today.toDateString()
    if (!isSameDate) return false
    const [hour, min] = slot.split(":").map(Number)
    const slotTime = new Date(date)
    slotTime.setHours(hour, min, 0, 0)
    return slotTime <= today
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((slot) => {
        const isUnavailable = unavailable.has(slot) || isPastTime(slot)
        const isSelected = selected === slot

        return (
          <Button
            key={slot}
            variant={isSelected ? "default" : "ghost"}
            disabled={isUnavailable}
            onClick={() => onSelect(slot)}
            className={cn(
              "flex h-auto items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-150",
              !isUnavailable && !isSelected && "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
              isSelected && "border-primary/60 bg-primary/15 text-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.25)] hover:bg-primary/20",
              isUnavailable && "opacity-30 border-white/5 bg-white/2"
            )}
          >
            <Icon icon={Clock} size="xs" className={isSelected ? "text-primary" : "text-muted-foreground"} />
            {slot}
          </Button>
        )
      })}
    </div>
  )
}

interface ConfirmationViewProps {
  date: Date
  time: string
  duration: number
  isSubmitting: boolean
  error: string | null
  onBack: () => void
  onConfirm: () => void
}

function ConfirmationView({ date, time, duration, isSubmitting, error, onBack, onConfirm }: ConfirmationViewProps) {
  const formattedDate = date.toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  })

  const [hour, min] = time.split(":").map(Number)
  const endDate = new Date(date)
  endDate.setHours(hour, min + duration)
  const endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="h-full flex flex-col justify-between space-y-5"
    >
      <div className="text-center">
        <p className="text-base font-semibold uppercase tracking-widest text-muted-foreground">
          Confirmar reserva
        </p>
        <h3 className="mt-1 text-lg font-bold text-foreground capitalize">{formattedDate}</h3>
        <p className="text-base text-muted-foreground">{time} – {endTime} · {duration} min</p>
      </div>

      <GlassCard className="p-4 space-y-3 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Icon icon={CalendarDays} size="sm" className="mt-0.5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground capitalize">{formattedDate}</p>
            <p className="text-base text-muted-foreground">{time} – {endTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Icon icon={Sparkles} size="sm" className="text-primary" />
          <p className="text-sm text-foreground">Demo personalizada con <BrandName /></p>
        </div>
        <div className="flex items-center gap-3">
          <Icon icon={Clock} size="sm" className="text-primary" />
          <p className="text-base text-muted-foreground">{duration} minutos · Videollamada</p>
        </div>
      </GlassCard>

      <div className="flex flex-col gap-2">
        <Button size="lg" className="w-full gap-2" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Confirmando..." : "Confirmar reserva"}
          <Icon icon={CheckCircle2} size="sm" />
        </Button>
        {error && <div className="text-xs text-destructive">{error}</div>}
        <Button variant="ghost" size="sm" className="w-full" onClick={onBack}>
          Cambiar fecha u hora
        </Button>
      </div>
    </motion.div>
  )
}

interface SuccessViewProps {
  date: Date
  time: string
}

function SuccessView({ date, time }: SuccessViewProps) {
  const formattedDate = date.toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 py-4 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 border border-success/30">
        <Icon icon={CheckCircle2} size="xl" variant="primary" className="text-success" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-bold text-foreground">¡Demo reservada!</p>
        <p className="text-base text-muted-foreground capitalize">{formattedDate} · {time}</p>
      </div>
      <p className="max-w-xs text-base text-muted-foreground">
        Recibirás un email de confirmación con el enlace a la videollamada.
      </p>
      <Badge variant="accent" className="gap-2">
        <Icon icon={CheckCircle2} size="xs" />
        Confirmación enviada
      </Badge>
    </motion.div>
  )
}


// ── BookingCalendar ────────────────────────────────────────────────────────────

export interface BookingCalendarProps {
  className?: string
  onBooked?: (date: Date, time: string, duration: number) => void
}

export function BookingCalendar({ className, onBooked }: BookingCalendarProps) {
  const router = useRouter()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [duration, setDuration] = useState(30)
  const [isRegisteredClient, setIsRegisteredClient] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [desktopStep, setDesktopStep] = useState<"calendar" | "confirm" | "success">("calendar")
  const [slots, setSlots] = useState<string[]>([])
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set())
  const [dayAvailability, setDayAvailability] = useState<Record<string, "available" | "unavailable">>({})
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [duplicateBookingDialogOpen, setDuplicateBookingDialogOpen] = useState(false)
  const [duplicateBookingDialogBookingId, setDuplicateBookingDialogBookingId] = useState<string | null>(null)
  const [activeBookingBlock, setActiveBookingBlock] = useState<{
    bookingId: string
    date: string
    time: string
    duration: number
    demoExpiresAt: string
    contactSubmitted: boolean
  } | null>(null)
  const isDurationDisabled = (value: number) => !isRegisteredClient && value > 30

  useEffect(() => {
    const storedBookingToken = storage.get<string | null>("local", "booking_access_token", null)
    const validBookingToken = isValidAccessToken(storedBookingToken) ? storedBookingToken : null

    if (!validBookingToken && storedBookingToken) {
      storage.remove("local", "booking_access_token")
      return
    }

    const storedBooking = storage.get<{ bookingId?: string } | null>("local", "booking", null)
    if (!validBookingToken || !storedBooking?.bookingId) return

    const loadActiveBooking = async () => {
      try {
        const booking = await getBooking(storedBooking.bookingId!, validBookingToken)
        const isActiveDemo =
          new Date(booking.demoExpiresAt).getTime() > Date.now() &&
          booking.status !== "expired" &&
          booking.status !== "cancelled"

        if (isActiveDemo) {
          setActiveBookingBlock({
            bookingId: booking.bookingId,
            date: booking.date,
            time: booking.time,
            duration: booking.duration,
            demoExpiresAt: booking.demoExpiresAt,
            contactSubmitted: booking.contactSubmitted ?? false,
          })
          setDuplicateBookingDialogBookingId(booking.bookingId)
          setDuplicateBookingDialogOpen(true)
          return
        }

        setActiveBookingBlock(null)
      } catch {
        setActiveBookingBlock(null)
      }
    }

    loadActiveBooking()
  }, [])

  useEffect(() => {
    if (activeBookingBlock) return

    const sessionToken = storage.get<string | null>("local", "roi_access_token", null)
    const validSessionToken = isValidAccessToken(sessionToken) ? sessionToken : null
    if (!validSessionToken) return

    const recoverActiveBooking = async () => {
      try {
        const booking = await getActiveBookingBySession(validSessionToken)
        if (!booking || !booking.accessToken) return

        storage.set("local", "booking_access_token", booking.accessToken)
        storage.set("local", "booking", booking)

        const isActiveDemo =
          new Date(booking.demoExpiresAt).getTime() > Date.now() &&
          booking.status !== "expired" &&
          booking.status !== "cancelled"

        if (!isActiveDemo) return

        setActiveBookingBlock({
          bookingId: booking.bookingId,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
          demoExpiresAt: booking.demoExpiresAt,
          contactSubmitted: booking.contactSubmitted ?? false,
        })
        setDuplicateBookingDialogBookingId(booking.bookingId)
        setDuplicateBookingDialogOpen(true)
      } catch {
        // Sin reserva activa para esta sesión.
      }
    }

    recoverActiveBooking()
  }, [activeBookingBlock])

  useEffect(() => {
    const savedBooking = storage.get<{
      contactSubmitted?: boolean
      contact?: { email?: string | null } | null
    } | null>("local", "booking", null)
    const registered = Boolean(savedBooking?.contactSubmitted || savedBooking?.contact?.email)
    setIsRegisteredClient(registered)
    if (!registered) {
      setDuration(30)
    }
  }, [])

  // Restaurar estado desde localStorage al montar
  useEffect(() => {
    if (activeBookingBlock) return
    const saved = storage.get<{
      date: string
      time: string
      duration: number
      expiresAt: string
    } | null>("local", "booking", null)

    if (!saved) return

    const date = new Date(saved.date)
    const now = new Date()
    const expiration = new Date(saved.expiresAt)

    if (now < expiration) {
      setSelectedDate(date)
      setSelectedTime(saved.time)
      setDuration(saved.duration)
      setYear(date.getFullYear())
      setMonth(date.getMonth())
      setShowSuccess(false)
      setDesktopStep("confirm")
    }
  }, [activeBookingBlock])

  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      setUnavailable(new Set())
      setAvailabilityError(null)
      return
    }

    let mounted = true

    const run = async () => {
      setIsLoadingAvailability(true)
      setAvailabilityError(null)
      try {
        const data = await getAvailability(formatLocalDateKey(selectedDate))
        if (!mounted) return
        setSlots(data.slots ?? [])
        setUnavailable(new Set(data.unavailable ?? []))
      } catch (error) {
        if (!mounted) return
        setSlots([])
        setUnavailable(new Set())
        setAvailabilityError(error instanceof Error ? error.message : "No se pudieron cargar los horarios")
      } finally {
        if (mounted) setIsLoadingAvailability(false)
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [selectedDate])

  useEffect(() => {
    let mounted = true
    const daysInMonth = getDaysInMonth(year, month)

    const run = async () => {
      const nextAvailability: Record<string, "available" | "unavailable"> = {}
      const requests: Promise<void>[] = []

      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day)
        const dateKey = formatLocalDateKey(date)
        const past = isPast(year, month, day)
        const weekend = isWeekend(year, month, day)

        if (past || weekend) {
          nextAvailability[dateKey] = "unavailable"
          continue
        }

        requests.push(
          getAvailability(dateKey)
            .then((data) => {
              const totalSlots = data.slots?.length ?? 0
              const occupiedSlots = data.unavailable?.length ?? 0
              const fullyOccupied = totalSlots === 0 || occupiedSlots >= totalSlots
              nextAvailability[dateKey] = fullyOccupied ? "unavailable" : "available"
            })
            .catch(() => {
              nextAvailability[dateKey] = "unavailable"
            })
        )
      }

      await Promise.all(requests)
      if (!mounted) return
      setDayAvailability(nextAvailability)
    }

    run()
    return () => {
      mounted = false
    }
  }, [year, month])

  function handlePrevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear((v) => v - 1)
      return
    }
    setMonth((v) => v - 1)
  }

  function handleNextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear((v) => v + 1)
      return
    }
    setMonth((v) => v + 1)
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    setSelectedTime(null)
    setDesktopStep("calendar")
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time)
    setDesktopStep("calendar")
  }

  async function handleConfirm(payload: BookingWizardSubmitPayload) {
    setIsSubmitting(true)
    setSubmitError(null)
    const finalDuration = isRegisteredClient ? payload.duration : 30
    try {
      const store = useROIStore.getState()
      const recaptchaToken = await getRecaptchaToken("booking_create")
      const response = await createBooking({
        date: formatLocalDateKey(payload.date),
        time: payload.time,
        duration: finalDuration,
        sessionToken: store.accessToken ?? null,
        recaptchaToken,
      })

      setSelectedDate(payload.date)
      setSelectedTime(payload.time)
      setDuration(finalDuration)

      onBooked?.(payload.date, payload.time, finalDuration)

      store.setExpiration(response.expiresAt)
      store.setFormExpiration(response.formExpiresAt)

      storage.set("local", "booking_access_token", response.accessToken)
      storage.set("local", "booking", response)
      try {
        localStorage.setItem("clinvetia:booking-updated", String(Date.now()))
      } catch {}
      window.dispatchEvent(new Event("clinvetia:booking-updated"))

      setShowSuccess(true)
      setDesktopStep("success")

      setTimeout(() => {
        const sessionToken = store.accessToken ?? store.token ?? ""
        const params = new URLSearchParams({
          booking_id: response.bookingId,
        })
        if (response.accessToken) params.set("booking_token", response.accessToken)
        if (sessionToken) params.set("session_token", sessionToken)
        router.push(`/contacto?${params.toString()}`)
      }, 2500)
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo confirmar la reserva"
      if (error instanceof ApiError && error.status === 409 && message.includes("Ya tienes una demo reservada activa")) {
        const data = error.data as { bookingId?: string } | null
        setDuplicateBookingDialogBookingId(data?.bookingId ?? null)
        setDuplicateBookingDialogOpen(true)
      } else {
        setDuplicateBookingDialogBookingId(null)
        setSubmitError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog
        open={duplicateBookingDialogOpen}
        onOpenChange={(open) => {
          setDuplicateBookingDialogOpen(open)
          if (!open && activeBookingBlock) {
            router.push("/")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-warning/30 bg-warning/10 sm:mx-0">
              <Icon icon={AlertCircle} size="xl" variant="warning" />
            </div>
            <DialogTitle>Ya tienes una demo activa reservada</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Para evitar duplicados, no permitimos crear otra reserva mientras tu cita actual siga activa.
              Si necesitas cambiar fecha u hora, puedes gestionarlo desde los correos de confirmaci&oacute;n.
            </DialogDescription>
          </DialogHeader>
          {activeBookingBlock && (
            <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Icon icon={CalendarDays} size="default" variant="primary" className="mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground capitalize">
                    {new Date(activeBookingBlock.date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeBookingBlock.time} · {activeBookingBlock.duration} min
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon icon={Clock} size="default" variant="muted" className="mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Activa hasta {new Date(activeBookingBlock.demoExpiresAt).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:[&>*]:flex-1">
            <Button variant="ghost" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
            <Button
              onClick={() => {
                const bookingId = duplicateBookingDialogBookingId || activeBookingBlock?.bookingId
                if (bookingId) {
                  router.push(`/contacto?booking_id=${encodeURIComponent(bookingId)}`)
                  return
                }
                router.push("/contacto")
              }}
            >
              Ir a contacto
              <Icon icon={ArrowRight} size="sm" className="ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {activeBookingBlock ? (
        <div className={cn("min-h-[8rem]", className)} aria-hidden />
      ) : (
        <>
          <div className={cn("space-y-4 lg:hidden", className)}>
            <AnimatePresence mode="wait">
              {showSuccess && selectedDate && selectedTime ? (
                <GlassCard key="success" className="p-6">
                  <SuccessView date={selectedDate} time={selectedTime} />
                </GlassCard>
              ) : (
                <motion.div
                  key="wizard"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <BookingWizard
                    title="Reserva tu demo"
                    subtitle="Selecciona un día, elige hora y confirma tu videollamada"
                    confirmCtaLabel="Confirmar reserva"
                    confirmingLabel="Confirmando..."
                    initialDate={selectedDate}
                    initialTime={selectedTime}
                    initialDuration={duration}
                    durationOptions={DURATION_OPTIONS.map((option) => ({
                      ...option,
                      disabled: isDurationDisabled(option.value),
                    }))}
                    initialStep={selectedDate && selectedTime ? "confirm" : selectedDate ? "time" : "date"}
                  loadAvailability={async (date) => getAvailability(formatLocalDateKey(date))}
                    onSubmit={handleConfirm}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center justify-center gap-2 text-base text-muted-foreground">
              <AvatarGroup size="xs" max={4}>
                {TEAM_MEMBERS.map((m) => (
                  <Avatar key={m.initials} initials={m.initials} size="xs" variant={m.variant} />
                ))}
              </AvatarGroup>
              <span>+120 demos realizadas este mes</span>
            </div>
          </div>

          <div className={cn("hidden gap-6 lg:grid lg:grid-cols-[1fr_360px]", className)}>
            <GlassCard className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold uppercase tracking-widest text-muted-foreground">
                    Reserva tu demo
                  </p>
                  <h2 className="mt-0.5 text-xl font-bold text-foreground">
                    Elige día y hora
                  </h2>
                </div>
                <AvatarGroup size="sm" max={3}>
                  {TEAM_MEMBERS.map((m) => (
                    <Avatar key={m.initials} initials={m.initials} variant={m.variant} />
                  ))}
                </AvatarGroup>
              </div>

              <div className="space-y-2">
                <p className="text-base font-medium text-muted-foreground">Duración de la sesión</p>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      disabled={isDurationDisabled(opt.value)}
                      variant={duration === opt.value ? "default" : "ghost"}
                      onClick={() => setDuration(opt.value)}
                      className={cn(
                        "flex-1 cursor-pointer rounded-xl border px-3 py-2 text-left transition-all duration-150",
                        isDurationDisabled(opt.value) && "cursor-not-allowed opacity-40 hover:border-white/10 hover:text-muted-foreground",
                        duration === opt.value
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
                      )}
                    >
                      <p className="text-sm font-bold">{opt.label}</p>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <CalendarGrid
                  year={year}
                  month={month}
                  selected={selectedDate}
                  dayAvailability={dayAvailability}
                  onSelect={handleDateSelect}
                  onPrev={handlePrevMonth}
                  onNext={handleNextMonth}
                />
              </div>

              <div className="flex flex-wrap gap-4 text-base text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/40 ring-1 ring-primary/60" />
                  Disponible
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  Seleccionado
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/45 ring-1 ring-white/60" />
                  No disponible
                </span>
              </div>
            </GlassCard>

            <div className="flex flex-col gap-4">
              <AnimatePresence mode="wait">
                {desktopStep === "success" && selectedDate && selectedTime ? (
                  <GlassCard key="success" className="flex-1 p-6">
                    <SuccessView date={selectedDate} time={selectedTime} />
                  </GlassCard>
                ) : desktopStep === "confirm" && selectedDate && selectedTime ? (
                  <GlassCard key="confirm" className="flex-1 p-6">
                    <ConfirmationView
                      date={selectedDate}
                      time={selectedTime}
                      duration={duration}
                      isSubmitting={isSubmitting}
                      error={submitError}
                      onBack={() => setDesktopStep("calendar")}
                      onConfirm={() => {
                        if (!selectedDate || !selectedTime) return
                        handleConfirm({
                          date: selectedDate,
                          time: selectedTime,
                          duration: isRegisteredClient ? duration : 30,
                        })
                      }}
                    />
                  </GlassCard>
                ) : (
                  <motion.div
                    key="slots"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-1 flex-col gap-4"
                  >
                    <GlassCard className="flex-1 p-5 space-y-4">
                      {selectedDate ? (
                        <>
                          <div>
                            <p className="text-base font-semibold uppercase tracking-widest text-muted-foreground">
                              Horarios disponibles
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-foreground capitalize">
                              {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                          </div>
                          {isLoadingAvailability ? (
                            <div className="grid grid-cols-2 gap-2">
                              {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-10 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
                              ))}
                            </div>
                          ) : availabilityError ? (
                            <div className="text-sm text-destructive">{availabilityError}</div>
                          ) : (
                            <>
                              <TimeSlotPicker
                                date={selectedDate}
                                slots={slots}
                                unavailable={unavailable}
                                selected={selectedTime}
                                onSelect={handleTimeSelect}
                              />
                              {!availabilityError && slots.length === 0 && (
                                <div className="text-sm text-muted-foreground">No hay horarios disponibles para este día.</div>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
                          <Icon icon={CalendarDays} size="xl" className="text-muted-foreground/40" />
                          <p className="text-base text-muted-foreground">
                            Selecciona un día para ver los horarios disponibles
                          </p>
                        </div>
                      )}
                    </GlassCard>

                    <Button
                      size="lg"
                      className="w-full gap-2"
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setDesktopStep("confirm")}
                    >
                      Continuar
                      <Icon icon={ArrowRight} size="sm" />
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-base text-muted-foreground">
                      <AvatarGroup size="xs" max={4}>
                        {TEAM_MEMBERS.map((m) => (
                          <Avatar key={m.initials} initials={m.initials} size="xs" variant={m.variant} />
                        ))}
                      </AvatarGroup>
                      <span>+120 demos realizadas este mes</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ── BookingSection ─────────────────────────────────────────────────────────────

export interface BookingSectionProps {
  id?: string
  className?: string
  onBooked?: BookingCalendarProps["onBooked"]
}

export function BookingSection({ id, className, onBooked }: BookingSectionProps) {
  return (
    <section id={id} className={cn("py-24 md:py-32", className)}>
      <div className="container mx-auto px-4">

        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <Badge variant="default" className="mb-4">Sin compromiso · Gratuita</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Reserva tu{" "}
            <span className="text-gradient-primary">demo personalizada</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">
            Elige el día y la hora que mejor te venga. Nuestro equipo te mostrará
            cómo <BrandName /> se adapta a tu clínica en menos de 30 minutos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <BookingCalendar onBooked={onBooked} />
        </motion.div>

      </div>
    </section>
  )
}
