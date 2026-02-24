"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, Mail, Phone, MapPin, Clock, CheckCircle2, Send, ArrowRight, Info, CalendarDays, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/GlassCard"
import { useROIStore } from "@/store/roi-store"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface FormData {
  nombre: string
  email: string
  telefono: string
  clinica: string
  mensaje: string
}

const initialFormData: FormData = {
  nombre: "",
  email: "",
  telefono: "",
  clinica: "",
  mensaje: "",
}

const CONTACT_FIELDS = [
  { id: "nombre",   label: "Nombre completo *",     placeholder: "Dr. Juan García", required: true },
  { id: "email",    label: "Email profesional *",   placeholder: "juan@clinica.com", required: true, type: "email" },
  { id: "telefono", label: "Teléfono",              placeholder: "+34 612 345 678", type: "tel" },
  { id: "clinica",  label: "Nombre de la clínica",  placeholder: "Clínica Veterinaria Central" },
] as const

function ContactFormWithROI() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [storedBooking, setStoredBooking] = useState<{
    date: string;
    time: string;
    duration: string;
  } | null>(null)

  const {
    monthlyPatients,
    averageTicket,
    conversionLoss,
    isCalculated,
    reset: resetROI
  } = useROIStore()

  useEffect(() => {
    setMounted(true)
    const savedBooking = localStorage.getItem("clinvetia_booking")
    if (savedBooking) {
      try {
        const parsed = JSON.parse(savedBooking)
        if (new Date() < new Date(parsed.expiresAt)) {
          setStoredBooking(parsed)
        }
      } catch (e) { console.error(e) }
    }
  }, [])

  const bookingDateStr = searchParams.get("booking_date") || storedBooking?.date
  const bookingTime = searchParams.get("booking_time") || storedBooking?.time
  const bookingDuration = searchParams.get("booking_duration") || storedBooking?.duration
  const bookingDate = bookingDateStr ? new Date(bookingDateStr) : null
  const hasBooking = bookingDate && bookingTime

  const [showCalculatorPrompt, setShowCalculatorPrompt] = useState(false)

  useEffect(() => {
    if (mounted && averageTicket === 0) setShowCalculatorPrompt(true)
  }, [averageTicket, mounted])

  const perdidaMensual = Math.round(monthlyPatients * (conversionLoss / 100) * averageTicket)
  const recuperacionEstimada = Math.round(perdidaMensual * 0.7)
  const roi = Math.round(((recuperacionEstimada - 297) / 297) * 100)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      </motion.div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          <GlassCard className="p-6 md:p-8">
            <div className="space-y-4">
              {CONTACT_FIELDS.map((field) => (
                <div key={field.id} className="space-y-3">
                  <label htmlFor={field.id} className="text-sm font-medium">{field.label}</label>
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={formData[field.id as keyof FormData]}
                    onChange={handleChange}
                    required={field.required}
                    className="glass mt-2"
                  />
                </div>
              ))}
              <div className="space-y-3">
                <label htmlFor="mensaje" className="text-sm font-medium">Mensaje *</label>
                <Textarea
                  id="mensaje"
                  name="mensaje"
                  placeholder="Cuéntanos sobre tu clínica y cómo podemos ayudarte..."
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="glass resize-none mt-2"
                />
              </div>
            </div>
          </GlassCard>

          <div className="space-y-4">
            {mounted && (hasBooking ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <GlassCard className="p-0 overflow-hidden border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
                  <div className="bg-primary/20 px-4 py-3 border-b border-primary/30 flex items-center justify-between">
                    <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /><span className="text-xs font-bold text-primary uppercase tracking-wider">Tu Reserva Demo</span></div>
                    <Badge variant="primary" className="h-5 px-1.5 text-[10px]">Confirmada</Badge>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Fecha y hora</p>
                      <p className="text-sm font-bold capitalize">{bookingDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
                      <p className="text-base font-bold text-primary">{bookingTime} ({bookingDuration} min)</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5"><Sparkles className="h-3.5 w-3.5 text-primary" /><p className="text-xs text-muted-foreground">Demo personalizada con experto</p></div>
                    <Button variant="ghost" size="sm" className="w-full h-8 mt-2 text-xs border-primary/20 hover:bg-primary/10 hover:text-primary" asChild>
                      <Link href="/demo"><Clock className="mr-2 h-3 w-3" />Reagendar cita</Link>
                    </Button>
                  </div>
                  <div className="bg-primary/5 px-4 py-2 text-[10px] text-muted-foreground italic border-t border-white/10">Completa el formulario para recibir el enlace</div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard className="p-0 overflow-hidden border-warning/30 bg-warning/5">
                  <div className="bg-warning/10 px-4 py-3 border-b border-warning/20 flex items-center gap-2"><Info className="h-4 w-4 text-warning" /><span className="text-xs font-bold text-warning uppercase tracking-wider">Sin reserva previa</span></div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">No hemos detectado una reserva de demo activa para tu sesión.</p>
                    <Button variant="ghost" size="sm" className="w-full h-8 text-xs border-warning/20 hover:bg-warning/10 hover:text-warning" asChild>
                      <Link href="/demo">Reservar demo ahora<ArrowRight className="ml-2 h-3 w-3" /></Link>
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            {mounted && isCalculated && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <GlassCard className="p-0 overflow-hidden border-primary/30 bg-primary/5">
                  <div className="bg-primary/10 px-4 py-3 border-b border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /><span className="text-xs font-bold text-primary uppercase tracking-wider">Tu ROI Proyectado</span></div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary/60 hover:text-primary" asChild><Link href="/calculadora" title="Recalcular"><ArrowRight className="h-3 w-3" /></Link></Button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-end"><span className="text-xs text-muted-foreground">Pérdida mensual</span><span className="text-base font-bold text-destructive">-{perdidaMensual}€</span></div>
                    <div className="flex justify-between items-end border-t border-white/5 pt-2"><span className="text-xs text-muted-foreground">ROI Estimado</span><span className="text-xl font-bold text-success">+{roi}%</span></div>
                    <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                      <div className="space-y-0.5"><p className="text-[10px] uppercase text-muted-foreground">Pacientes</p><p className="text-sm font-semibold">{monthlyPatients}</p></div>
                      <div className="space-y-0.5"><p className="text-[10px] uppercase text-muted-foreground">Ticket</p><p className="text-sm font-semibold">{averageTicket}€</p></div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full h-8 text-xs border-primary/20 hover:bg-primary/10 hover:text-primary" asChild><Link href="/calculadora"><Calculator className="mr-2 h-3 w-3" />Recalcular ROI</Link></Button>
                  </div>
                  <div className="bg-primary/5 px-4 py-2 text-[10px] text-muted-foreground italic border-t border-white/5">Datos adjuntos a tu solicitud</div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] h-14 text-lg" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : <><Send className="size-5" />Enviar solicitud</>}
        </Button>
      </form>

      <Dialog open={showCalculatorPrompt} onOpenChange={setShowCalculatorPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 border border-warning/30"><Info className="h-7 w-7 text-warning" /></div>
            <DialogTitle className="text-center text-xl">¿Has usado la calculadora?</DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed">Si quieres una propuesta personalizada con el ROI real de tu clínica, te recomendamos usar primero la calculadora.</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-warning/5 border border-warning/20 p-4 space-y-2">
            <p className="text-base font-medium text-foreground">Con la calculadora tu reunión será diferente:</p>
            <ul className="space-y-1.5 text-base text-muted-foreground">
              {["Nos preparamos con tu perfil de clínica antes de la llamada", "Te mostramos proyecciones reales basadas en tu volumen", "La demo se adapta a tus casos de uso específicos"].map(item => (
                <li key={item} className="flex items-start gap-2"><span className="text-success mt-0.5 shrink-0">✓</span>{item}</li>
              ))}
            </ul>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="destructive" className="w-full sm:w-auto" onClick={() => router.back()}>Quedarme aquí</Button>
            <Button variant="default" className="w-full sm:w-auto" onClick={() => router.push("/calculadora")}>Ir a la calculadora<Calculator className="ml-2 h-4 w-4" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
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
