"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, Clock, CheckCircle2, Send, ArrowRight, Info, CalendarDays, Sparkles, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/GlassCard"
import { useROIStore } from "@/store/roi-store"
import { Badge } from "@/components/ui/badge"
import { BrandName } from "@/components/ui/brand-name"
import { Icon } from "@/components/ui/icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { sanitizeInput } from "@/lib/security"
import { storage } from "@/lib/storage"

interface FormData {
  nombre: string
  email: string
  telefono: string
  clinica: string
  mensaje: string
  token: string
}

const initialFormData: FormData = {
  nombre: "",
  email: "",
  telefono: "",
  clinica: "",
  mensaje: "",
  token: "",
}

const VALIDATION_RULES: Record<string, { min?: number, max: number }> = {
  nombre:   { min: 3, max: 50 },
  email:    { max: 100 },
  telefono: { min: 9, max: 15 },
  clinica:  { min: 2, max: 60 },
  mensaje:  { min: 10, max: 500 },
}

const CONTACT_FIELDS: { id: keyof FormData, label: string, placeholder: string, required: boolean, type?: string }[] = [
  { id: "nombre",   label: "Nombre completo *",     placeholder: "Dr. Juan García", required: true },
  { id: "email",    label: "Email profesional *",   placeholder: "juan@clinica.com", required: true, type: "email" },
  { id: "telefono", label: "Teléfono *",            placeholder: "+34 612 345 678", required: true, type: "tel" },
  { id: "clinica",  label: "Nombre de la clínica *", placeholder: "Clínica Veterinaria Central", required: true },
]

const isValidAccessToken = (token: string | null) => {
  if (!token) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
}

function ContactFormWithROI() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [localAccessToken, setLocalAccessToken] = useState<string | null>(null)
  
  const [storedBooking, setStoredBooking] = useState<{
    date: string;
    time: string;
    duration: string;
    formExpiresAt?: string;
  } | null>(null)

  const {
    accessToken,
    monthlyPatients,
    averageTicket,
    conversionLoss,
    isCalculated,
    formExpiresAt,
    setAccessToken,
    reset: resetROI
  } = useROIStore()

  useEffect(() => {
    setMounted(true)
    const storedAccessToken = storage.get<string | null>("local", "access_token", null)
    const validAccessToken = isValidAccessToken(storedAccessToken) ? storedAccessToken : null
    if (!validAccessToken && storedAccessToken) {
      storage.remove("local", "access_token")
      if (accessToken) setAccessToken(null)
    }
    setLocalAccessToken(validAccessToken)
    if (validAccessToken && !accessToken) {
      setAccessToken(validAccessToken)
    }

    const storedBookingRaw = localStorage.getItem("clinvetia_booking")
    if (storedBookingRaw) {
      try {
        const parsed = JSON.parse(storedBookingRaw) as {
          date: string
          time: string
          duration: string
          formExpiresAt?: string
        }
        setStoredBooking({
          date: parsed.date,
          time: parsed.time,
          duration: parsed.duration,
          formExpiresAt: parsed.formExpiresAt,
        })
      } catch {
        // Ignorar datos corruptos
      }
    }
  }, [accessToken, setAccessToken])

  // Si no hay acceso, mostramos el diálogo bloqueante sobre una estructura vacía
  if (mounted && !localAccessToken) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent 
            className="sm:max-w-md [&>button]:hidden" 
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader className="space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30">
                <Icon icon={Calculator} size="lg" variant="destructive" />
              </div>
              <DialogTitle className="text-center text-xl">Para seguir, hagamos tu cálculo de ROI</DialogTitle>
              <DialogDescription className="text-center text-base leading-relaxed">
                En <BrandName /> queremos darte una atención cercana y útil. Con los datos de la calculadora de ROI podremos evaluar tu clínica con más claridad y darte recomendaciones personalizadas.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
              <p className="text-base font-medium text-foreground text-center">¿Por qué lo pedimos?</p>
              <p className="text-sm text-muted-foreground text-center">
                Queremos que el tiempo de tu llamada sea súper aprovechado, con cifras reales y una evaluación hecha a tu medida.
              </p>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="ghost" className="w-full" onClick={() => router.push("/")}>
                Volver al inicio
              </Button>
              <Button variant="default" className="w-full" onClick={() => router.push("/calculadora")}>
                Ir a la calculadora
                <Icon icon={Calculator} size="sm" variant="primary" className="ml-2" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const isExpired = !!storedBooking && !formExpiresAt
  const bookingDateStr = searchParams.get("booking_date") || storedBooking?.date
  const bookingTime = searchParams.get("booking_time") || storedBooking?.time
  const bookingDuration = searchParams.get("booking_duration") || storedBooking?.duration
  const bookingDate = bookingDateStr ? new Date(bookingDateStr) : null
  const hasBooking = bookingDate && bookingTime

  const perdidaMensual = Math.round(monthlyPatients * (conversionLoss / 100) * averageTicket)
  const recuperacionEstimada = Math.round(perdidaMensual * 0.7)
  const roi = Math.round(((recuperacionEstimada - 297) / 297) * 100)

  const validateField = (name: keyof FormData, value: string) => {
    const rules = VALIDATION_RULES[name]
    if (!rules) return ""
    if (!value.trim()) return "Este campo es obligatorio"
    if (rules.min && value.length < rules.min) return `Mínimo ${rules.min} caracteres`
    if (value.length > rules.max) return `Máximo ${rules.max} caracteres`
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email no válido"
    return ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: keyof FormData, value: string }
    const sanitizedValue = sanitizeInput(value)
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }))
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, sanitizedValue) }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: keyof FormData, value: string }
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    let hasErrors = false
    ;(Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      const error = validateField(key, formData[key])
      if (error) { newErrors[key] = error; hasErrors = true }
    })
    if (hasErrors) { setErrors(newErrors); setTouched({ nombre: true, email: true, telefono: true, clinica: true, mensaje: true }); return }
    if (isExpired) { alert("Tu reserva ha expirado."); router.push("/demo"); return }
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    if (!hasBooking) resetROI()
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20"><CheckCircle2 className="h-10 w-10 text-primary" /></div>
        <h2 className="mb-2 text-2xl font-bold">¡Mensaje enviado!</h2>
        <p className="text-muted-foreground">Nuestro equipo te contactará en menos de 24 horas.</p>
        <Button className="mt-8" variant="ghost" asChild><Link href="/">Volver al inicio</Link></Button>
      </motion.div>
    )
  }

  const summaries = (
    <div className="space-y-4">
      {localAccessToken && (
        <GlassCard className="p-0 overflow-hidden border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
          <div className="bg-primary/20 px-4 py-3 border-b border-primary/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon={Calculator} size="xs" variant="primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Resumen ROI</span>
            </div>
            <Badge variant="primary" className="h-5 px-1.5 text-[10px]">Listo</Badge>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex justify-between"><span>Pacientes/mes</span><span className="font-semibold">{monthlyPatients}</span></div>
            <div className="flex justify-between"><span>Ticket medio</span><span className="font-semibold">{averageTicket}€</span></div>
            <div className="flex justify-between"><span>Pérdida de conversión</span><span className="font-semibold">{conversionLoss}%</span></div>
            <div className="border-t border-white/10 pt-2 flex justify-between"><span>Pérdida mensual</span><span className="font-semibold text-destructive">-{perdidaMensual.toLocaleString("es-ES")}€</span></div>
            <div className="flex justify-between"><span>Recuperable (70%)</span><span className="font-semibold text-success">+{recuperacionEstimada.toLocaleString("es-ES")}€</span></div>
            <div className="border-t border-white/10 pt-2 flex justify-between"><span>ROI proyectado</span><span className="font-bold text-success">{roi}%</span></div>
          </div>
        </GlassCard>
      )}
      {hasBooking ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard className="p-0 overflow-hidden border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
            <div className="bg-primary/20 px-4 py-3 border-b border-primary/30 flex items-center justify-between">
              <div className="flex items-center gap-2"><Icon icon={CalendarDays} size="xs" variant="primary" /><span className="text-xs font-bold text-primary uppercase tracking-wider">Tu Reserva Demo</span></div>
              <Badge variant="primary" className="h-5 px-1.5 text-[10px]">Confirmada</Badge>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Fecha y hora</p>
                <p className="text-sm font-bold capitalize">{bookingDate?.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
                <p className="text-base font-bold text-primary">{bookingTime} ({bookingDuration} min)</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/5"><Icon icon={Sparkles} size="sm" variant="primary" /><p className="text-xs text-muted-foreground">Demo personalizada con experto</p></div>
              <Button variant="ghost" size="sm" className="w-full h-8 mt-2 text-xs border-primary/20 hover:bg-primary/10 hover:text-primary" asChild>
                <Link href="/demo"><Icon icon={Clock} size="xs" className="mr-2" />Reagendar cita</Link>
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-0 overflow-hidden border-warning/30 bg-warning/5">
            <div className="bg-warning/10 px-4 py-3 border-b border-warning/20 flex items-center gap-2"><Icon icon={Info} size="xs" variant="warning" /><span className="text-xs font-bold text-warning uppercase tracking-wider">Sin reserva previa</span></div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">No hemos detectado una reserva de demo activa para tu sesión.</p>
              <Button variant="ghost" size="sm" className="w-full h-8 text-xs border-warning/20 hover:bg-warning/10 hover:text-warning" asChild>
                <Link href="/demo">Reservar demo ahora<Icon icon={ArrowRight} size="xs" className="ml-2" /></Link>
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {isCalculated && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard className="p-0 overflow-hidden border-primary/30 bg-primary/5">
            <div className="bg-primary/10 px-4 py-3 border-b border-primary/30 flex items-center justify-between">
              <div className="flex items-center gap-2"><Icon icon={Calculator} size="xs" variant="primary" /><span className="text-xs font-bold text-primary uppercase tracking-wider">Tu ROI Proyectado</span></div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary/60 hover:text-primary" asChild><Link href="/calculadora" title="Recalcular"><Icon icon={ArrowRight} size="xs" /></Link></Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-end"><span className="text-xs text-muted-foreground">Pérdida mensual</span><span className="text-base font-bold text-destructive">-{perdidaMensual}€</span></div>
              <div className="flex justify-between items-end border-t border-white/5 pt-2"><span className="text-xs text-muted-foreground">ROI Estimado</span><span className="text-xl font-bold text-success">+{roi}%</span></div>
              <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                <div className="space-y-0.5"><p className="text-[10px] uppercase text-muted-foreground">Pacientes</p><p className="text-sm font-semibold">{monthlyPatients}</p></div>
                <div className="space-y-0.5"><p className="text-[10px] uppercase text-muted-foreground">Ticket</p><p className="text-sm font-semibold">{averageTicket}€</p></div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )

  const submitButton = (
    <Button type="submit" size="lg" className="w-full gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] h-14 text-lg" disabled={isSubmitting}>
      {isSubmitting ? "Enviando..." : <><Send className="size-5" />Enviar solicitud</>}
    </Button>
  )

  return (
    <form onSubmit={handleSubmit} className="no-validate" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
        <div className="md:hidden">{summaries}</div>
        <div className="space-y-8">
          <GlassCard className="p-6 md:p-8 space-y-6">
            {CONTACT_FIELDS.map((field) => (
              <div key={field.id} className="space-y-3">
                <div className="mt-4 flex justify-between items-center">
                  <label htmlFor={field.id} className="text-sm font-medium">{field.label}</label>
                  <AnimatePresence>
                    {errors[field.id] && (
                      <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="hidden md:inline">{errors[field.id]}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <Input id={field.id} name={field.id} type={field.type || "text"} placeholder={field.placeholder} value={formData[field.id]} onChange={handleChange} onBlur={handleBlur} required className={cn("glass transition-all duration-200", errors[field.id] ? "border-destructive/50 ring-destructive/20 focus-visible:ring-destructive" : "")} />
              </div>
            ))}
            <div className="space-y-3">
              <div className="mt-4 flex justify-between items-center">
                <label htmlFor="mensaje" className="text-sm font-medium">Mensaje *</label>
                {errors.mensaje && <span className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1"><AlertCircle className="h-4 w-4" />{errors.mensaje}</span>}
              </div>
              <Textarea id="mensaje" name="mensaje" placeholder="Cuéntanos sobre tu clínica..." value={formData.mensaje} onChange={handleChange} onBlur={handleBlur} required rows={5} className={cn("glass resize-none transition-all duration-200", errors.mensaje ? "border-destructive/50 ring-destructive/20 focus-visible:ring-destructive" : "")} />
            </div>
          </GlassCard>
          <div className="md:hidden">{submitButton}</div>
        </div>
        <div className="hidden md:block space-y-6">{summaries}{submitButton}</div>
      </div>
    </form>
  )
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen py-24 md:py-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-6">Contacto</Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Hablemos de tu clínica</h1>
            <p className="text-lg text-muted-foreground">Nuestro equipo está listo para ayudarte a transformar tu gestión veterinaria.</p>
          </div>
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><p className="text-muted-foreground animate-pulse">Cargando...</p></div>}>
            <ContactFormWithROI />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
