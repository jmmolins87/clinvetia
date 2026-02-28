"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/GlassCard"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

const WEEK_DAYS = ["L", "M", "X", "J", "V", "S", "D"]

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const DEFAULT_DURATION_OPTIONS = [
  { label: "30m", value: 30 },
  { label: "45m", value: 45 },
  { label: "60m", value: 60 },
]

type Step = "date" | "time" | "confirm"

export interface BookingWizardAvailability {
  slots: string[]
  unavailable: string[]
}

export interface BookingWizardSubmitPayload {
  date: Date
  time: string
  duration: number
}

export interface BookingWizardProps {
  className?: string
  title?: string
  subtitle?: string
  confirmCtaLabel?: string
  confirmingLabel?: string
  showDurationSelector?: boolean
  durationOptions?: { label: string; value: number }[]
  initialDate?: Date | null
  initialTime?: string | null
  initialDuration?: number
  initialStep?: Step
  allowUnavailableSlot?: (slot: string, date: Date) => boolean
  loadAvailability: (date: Date) => Promise<BookingWizardAvailability>
  onSubmit: (payload: BookingWizardSubmitPayload) => Promise<void> | void
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

function isWeekend(year: number, month: number, day: number) {
  const d = new Date(year, month, day).getDay()
  return d === 0 || d === 6
}

function isPastDate(year: number, month: number, day: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(year, month, day) < today
}

function isPastTimeSlot(date: Date, slot: string) {
  const now = new Date()
  if (!isSameDay(date, now)) return false
  const [hour, min] = slot.split(":").map(Number)
  const slotTime = new Date(date)
  slotTime.setHours(hour, min, 0, 0)
  return slotTime <= now
}

function formatHumanDate(date: Date) {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function getEndTime(date: Date, time: string, duration: number) {
  const [hour, min] = time.split(":").map(Number)
  const endDate = new Date(date)
  endDate.setHours(hour, min + duration, 0, 0)
  return `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`
}

export function BookingWizard({
  className,
  title = "Elige día y hora",
  subtitle = "Selecciona un día para ver horarios disponibles",
  confirmCtaLabel = "Confirmar",
  confirmingLabel = "Confirmando...",
  showDurationSelector = true,
  durationOptions = DEFAULT_DURATION_OPTIONS,
  initialDate = null,
  initialTime = null,
  initialDuration = 45,
  initialStep = "date",
  allowUnavailableSlot,
  loadAvailability,
  onSubmit,
}: BookingWizardProps) {
  const today = new Date()
  const [year, setYear] = useState((initialDate ?? today).getFullYear())
  const [month, setMonth] = useState((initialDate ?? today).getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime)
  const [duration, setDuration] = useState(initialDuration)
  const [step, setStep] = useState<Step>(initialStep)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [slots, setSlots] = useState<string[]>([])
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set())
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialDateKey = initialDate ? initialDate.toISOString().slice(0, 10) : ""

  useEffect(() => {
    const nextDate = initialDate ?? null
    const baseDate = nextDate ?? new Date()
    setYear(baseDate.getFullYear())
    setMonth(baseDate.getMonth())
    setSelectedDate(nextDate)
    setSelectedTime(initialTime ?? null)
    setDuration(initialDuration)
    setStep(initialStep)
    setSubmitError(null)
    setAvailabilityError(null)
  }, [initialDate, initialDateKey, initialTime, initialDuration, initialStep])

  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      setUnavailable(new Set())
      return
    }

    let mounted = true

    const run = async () => {
      setIsLoadingAvailability(true)
      setAvailabilityError(null)
      try {
        const data = await loadAvailability(selectedDate)
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
  }, [loadAvailability, selectedDate])

  const canConfirm = Boolean(selectedDate && selectedTime)

  const calendarCells = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [year, month])

  const goStep = (nextStep: Step, nextDirection: 1 | -1) => {
    setDirection(nextDirection)
    setStep(nextStep)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setSubmitError(null)
    goStep("time", 1)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setSubmitError(null)
    goStep("confirm", 1)
  }

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((v) => v - 1)
      return
    }
    setMonth((v) => v - 1)
  }

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((v) => v + 1)
      return
    }
    setMonth((v) => v + 1)
  }

  const submit = async () => {
    if (!selectedDate || !selectedTime) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({ date: selectedDate, time: selectedTime, duration })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo completar la acción")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <GlassCard className={cn("p-5 md:p-6", className)}>
      <div className="space-y-5">
        <div className="space-y-2">
          <Badge variant="accent" className="w-fit">
            <Icon icon={CalendarDays} size="xs" />
            Agenda
          </Badge>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {showDurationSelector && (
          <div className="grid grid-cols-3 gap-3 pb-6">
            {durationOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={duration === option.value ? "default" : "ghost"}
                onClick={() => setDuration(option.value)}
                className={cn(
                  "w-full cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold",
                  duration === option.value
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ x: direction > 0 ? 56 : -56, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -56 : 56, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="p-4 md:p-5"
            >
              {step === "date" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevMonth}
                      className="h-8 w-8"
                      aria-label="Mes anterior"
                    >
                      <Icon icon={ChevronLeft} size="sm" />
                    </Button>
                    <div className="text-sm font-semibold text-foreground">
                      {MONTHS[month]} {year}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleNextMonth}
                      className="h-8 w-8"
                      aria-label="Mes siguiente"
                    >
                      <Icon icon={ChevronRight} size="sm" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {WEEK_DAYS.map((d) => (
                      <div key={d} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {d}
                      </div>
                    ))}
                    {calendarCells.map((day, i) => {
                      if (!day) return <div key={`empty-${i}`} />
                      const date = new Date(year, month, day)
                      const disabled = isPastDate(year, month, day) || isWeekend(year, month, day)
                      const isToday = isSameDay(date, new Date())
                      const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
                      return (
                        <button
                          key={`${year}-${month}-${day}`}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleDateSelect(date)}
                          className={cn(
                            "relative flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer",
                            !disabled && !isSelected && "hover:bg-primary/10 hover:text-primary",
                            isToday && !isSelected && "border border-primary/40 text-primary",
                            isSelected && "bg-primary text-primary-foreground shadow-[0_0_14px_rgba(var(--primary-rgb),0.35)]"
                          )}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {step === "time" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Horarios</p>
                      <p className="text-sm font-semibold capitalize text-foreground">
                        {selectedDate ? formatHumanDate(selectedDate) : "Selecciona un día"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-auto shrink-0"
                      onClick={() => goStep("date", -1)}
                    >
                      <Icon icon={ArrowLeft} size="sm" className="mr-1" />
                      Volver
                    </Button>
                  </div>

                  {isLoadingAvailability ? (
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-10 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {slots.map((slot) => {
                        const blockedByAvailability = unavailable.has(slot)
                        const blockedByTime = selectedDate ? isPastTimeSlot(selectedDate, slot) : false
                        const allowedException = selectedDate ? Boolean(allowUnavailableSlot?.(slot, selectedDate)) : false
                        const isUnavailable = (blockedByAvailability || blockedByTime) && !allowedException
                        const isSelected = selectedTime === slot
                        return (
                          <Button
                            key={slot}
                            type="button"
                            disabled={isUnavailable}
                            onClick={() => handleTimeSelect(slot)}
                            variant={isSelected ? "accent" : "ghost"}
                            className={cn(
                              "h-10 w-full justify-center rounded-xl border px-3 text-sm font-semibold",
                              !isUnavailable && !isSelected && "border-white/10 bg-white/5 hover:border-accent/30 hover:bg-accent/10",
                              isSelected && "border-accent/60 bg-accent/20 text-accent shadow-[0_0_14px_rgba(var(--accent-rgb),0.2)]",
                              isUnavailable && "border-white/5 bg-white/5 opacity-35"
                            )}
                          >
                            <Icon icon={Clock} size="xs" className="mr-1" />
                            {slot}
                          </Button>
                        )
                      })}
                    </div>
                  )}

                  {availabilityError && <div className="text-xs text-destructive">{availabilityError}</div>}
                  {!isLoadingAvailability && !availabilityError && slots.length === 0 && (
                    <div className="text-sm text-muted-foreground">No hay horarios disponibles para este día.</div>
                  )}
                </div>
              )}

              {step === "confirm" && selectedDate && selectedTime && (
                <div className="space-y-4">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Confirmación</p>
                      <p className="text-sm font-semibold capitalize text-foreground">{formatHumanDate(selectedDate)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-auto shrink-0"
                      onClick={() => goStep("time", -1)}
                    >
                      <Icon icon={ArrowLeft} size="sm" className="mr-1" />
                      Volver
                    </Button>
                  </div>

                  <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <Icon icon={CalendarDays} size="default" variant="primary" className="mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold capitalize text-foreground">{formatHumanDate(selectedDate)}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedTime} - {getEndTime(selectedDate, selectedTime, duration)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon icon={Clock} size="default" variant="muted" />
                      <div className="text-sm text-muted-foreground">{duration} minutos</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon icon={Sparkles} size="default" variant="primary" className="text-primary" />
                      <div className="text-sm text-foreground">Revisa los datos antes de confirmar</div>
                    </div>
                  </div>

                  {submitError && <div className="text-xs text-destructive">{submitError}</div>}

                  <div>
                    <Button type="button" className="w-full gap-2" disabled={!canConfirm || isSubmitting} onClick={submit}>
                      {isSubmitting ? confirmingLabel : confirmCtaLabel}
                      <Icon icon={isSubmitting ? Clock : CheckCircle2} size="lg" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary/40 ring-1 ring-primary/60" />
            Disponible
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent/60 ring-1 ring-accent/70" />
            Seleccionado
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            No disponible
          </span>
        </div>
      </div>
    </GlassCard>
  )
}
