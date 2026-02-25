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
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/GlassCard"
import { Avatar, AvatarGroup } from "@/components/ui/avatar"
import { BrandName } from "@/components/ui/brand-name"
import { Icon } from "@/components/ui/icon"
import { useROIStore } from "@/store/roi-store"

// ── Datos ──────────────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { initials: "AM", variant: "primary" as const },
  { initials: "JL", variant: "secondary" as const },
  { initials: "PR", variant: "default" as const },
]

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30",
]

const UNAVAILABLE_SLOTS = new Set(["09:30", "11:00", "12:00", "15:30", "17:00"])

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

// ── Sub-componentes ────────────────────────────────────────────────────────────

interface CalendarGridProps {
  year: number
  month: number
  selected: Date | null
  onSelect: (date: Date) => void
  onPrev: () => void
  onNext: () => void
}

function CalendarGrid({ year, month, selected, onSelect, onPrev, onNext }: CalendarGridProps) {
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
          const disabled = past || weekend

          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={cn(
                "relative flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer",
                !disabled && !isSelected && "hover:bg-primary/15 hover:text-primary",
                isToday && !isSelected && "border border-primary/40 text-primary",
                isSelected && "bg-primary text-primary-foreground shadow-[0_0_16px_rgba(var(--primary-rgb),0.5)]",
              )}
              aria-label={`${day} de ${MONTHS[month]}`}
              aria-pressed={isSelected}
            >
              {day}
              {isToday && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}


interface TimeSlotPickerProps {
  selected: string | null
  onSelect: (slot: string) => void
}

function TimeSlotPicker({ selected, onSelect }: TimeSlotPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TIME_SLOTS.map((slot) => {
        const unavailable = UNAVAILABLE_SLOTS.has(slot)
        const isSelected = selected === slot

        return (
          <Button
            key={slot}
            variant={isSelected ? "default" : "ghost"}
            disabled={unavailable}
            onClick={() => onSelect(slot)}
            className={cn(
              "flex h-auto items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-150",
              !unavailable && !isSelected && "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
              isSelected && "border-primary/60 bg-primary/15 text-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.25)] hover:bg-primary/20",
              unavailable && "opacity-30 border-white/5 bg-white/2"
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
  onBack: () => void
  onConfirm: () => void
}

function ConfirmationView({ date, time, duration, onBack, onConfirm }: ConfirmationViewProps) {
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
        <Button size="lg" className="w-full gap-2" onClick={onConfirm}>
          Confirmar reserva
          <Icon icon={CheckCircle2} size="sm" />
        </Button>
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

type Step = "calendar" | "confirm" | "success"

export function BookingCalendar({ className, onBooked }: BookingCalendarProps) {
  const router = useRouter()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [duration, setDuration] = useState(45)
  const [step, setStep] = useState<Step>("calendar")

  // Restaurar estado desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem("clinvetia_booking")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const date = new Date(parsed.date)
        const now = new Date()
        const expiration = new Date(parsed.expiresAt)
        
        if (now < expiration) {
          setSelectedDate(date)
          setSelectedTime(parsed.time)
          setDuration(parseInt(parsed.duration))
          setYear(date.getFullYear())
          setMonth(date.getMonth())
          setStep("confirm") // Ir directamente al resumen en el panel derecho
        }
      } catch (e) {
        console.error("Error restoring booking", e)
      }
    }
  }, [])

  function handlePrevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function handleNextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  function handleConfirm() {
    if (selectedDate && selectedTime) {
      onBooked?.(selectedDate, selectedTime, duration)
      
      const store = useROIStore.getState()
      
      // Aseguramos que el usuario pueda acceder a contacto tras reservar
      store.setHasAcceptedDialog(true)
      
      const expirationDate = new Date(selectedDate)
      expirationDate.setHours(23, 59, 59, 999)
      const expiresAt = expirationDate.toISOString()
      
      // Persistimos la expiración en el store global
      store.setExpiration(expiresAt)
      
      const bookingData = {
        date: selectedDate.toISOString(),
        time: selectedTime,
        duration: duration.toString(),
        expiresAt: expiresAt,
        token: store.token // Incluimos el token de sesión
      }
      
      localStorage.setItem("clinvetia_booking", JSON.stringify(bookingData))
      
      // Construir params para la página de contacto incluyendo el token
      const params = new URLSearchParams({
        booking_date: bookingData.date,
        booking_time: bookingData.time,
        booking_duration: bookingData.duration,
        session_token: store.token || "",
      })
      
      router.push(`/contacto?${params.toString()}`)
    }
  }

  const canProceed = selectedDate !== null && selectedTime !== null

  return (
    <div className={cn("grid gap-6 grid-cols-1 lg:grid-cols-[1fr_360px] lg:grid-rows-1", className)}>

      {/* ── Panel izquierdo: calendario + slots ──────────────────────────── */}
      <GlassCard className="p-6 space-y-6 lg:h-full">

        {/* Cabecera */}
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

        {/* Duración */}
        <div className="my-3">
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={duration === opt.value ? "default" : "ghost"}
                onClick={() => setDuration(opt.value)}
                className={cn(
                  "flex-1 cursor-pointer rounded-xl border px-2 py-3 text-center transition-all duration-150",
                  duration === opt.value
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground",
                )}
              >
                <p className="text-xs font-bold"><span className="hidden md:inline">Sesión de </span>{opt.label}</p>
              </Button>
            ))}
          </div>
        </div>

        {/* Grid del mes */}
        <CalendarGrid
          year={year}
          month={month}
          selected={selectedDate}
          onSelect={handleDateSelect}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 text-base text-muted-foreground mt-6 md:mt-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary/40 ring-1 ring-primary/60" />
            Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Seleccionado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            No disponible
          </span>
        </div>
      </GlassCard>

      {/* ── Panel derecho: horarios + confirmación ────────────────────────── */}
      <div className="flex flex-col gap-4 h-full min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === "success" && selectedDate && selectedTime ? (
            <GlassCard key="success" className="flex-1 p-6 flex flex-col justify-center h-full">
              <SuccessView date={selectedDate} time={selectedTime} />
            </GlassCard>
          ) : step === "confirm" && selectedDate && selectedTime ? (
            <GlassCard key="confirm" className="flex-1 p-6 h-full">
              <ConfirmationView
                date={selectedDate}
                time={selectedTime}
                duration={duration}
                onBack={() => setStep("calendar")}
                onConfirm={handleConfirm}
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
                    <TimeSlotPicker
                      selected={selectedTime}
                      onSelect={setSelectedTime}
                    />
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
                    <Icon icon={CalendarDays} size="xl" variant="muted" className="opacity-40" />
                    <p className="text-base text-muted-foreground">
                      Selecciona un día para ver los horarios disponibles
                    </p>
                  </div>
                )}
              </GlassCard>

              <Button
                size="lg"
                className="w-full gap-2"
                disabled={!canProceed}
                onClick={() => setStep("confirm")}
              >
                Continuar
                <Icon icon={ArrowRight} size="sm" />
              </Button>

              {/* Social proof */}
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
