"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Calculator, Mail, Phone, MapPin, Clock, CheckCircle2, Send, ArrowRight, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/GlassCard"
import { useROIStore } from "@/store/roi-store"
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

function ContactFormWithROI() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)

  const {
    monthlyPatients,
    averageTicket,
    conversionLoss,
    isCalculated,
  } = useROIStore()

  const [showCalculatorPrompt, setShowCalculatorPrompt] = useState(false)

  useEffect(() => {
    setMounted(true)
    // El diálogo sale si el ticket es 0
    if (averageTicket === 0) {
      setShowCalculatorPrompt(true)
    }
  }, [averageTicket])

  const perdidaMensual = Math.round(monthlyPatients * (conversionLoss / 100) * averageTicket)
  const recuperacionEstimada = Math.round(perdidaMensual * 0.7)
  const roi = Math.round(((recuperacionEstimada - 297) / 297) * 100)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">¡Mensaje enviado!</h2>
        <p className="text-muted-foreground">
          Nuestro equipo te contactará en menos de 24 horas.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_300px]">
      <GlassCard className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium">
                Nombre completo *
              </label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Dr. Juan García"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="glass"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email profesional *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="juan@clinica.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="telefono" className="text-sm font-medium">
                Teléfono
              </label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="+34 612 345 678"
                value={formData.telefono}
                onChange={handleChange}
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="clinica" className="text-sm font-medium">
                Nombre de la clínica
              </label>
              <Input
                id="clinica"
                name="clinica"
                placeholder="Clínica Veterinaria Central"
                value={formData.clinica}
                onChange={handleChange}
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="mensaje" className="text-sm font-medium">
                Mensaje *
              </label>
              <Textarea
                id="mensaje"
                name="mensaje"
                placeholder="Cuéntanos sobre tu clínica y cómo podemos ayudarte..."
                value={formData.mensaje}
                onChange={handleChange}
                required
                rows={5}
                className="glass resize-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="size-4" />
                Enviar solicitud
              </>
            )}
          </Button>
        </form>
      </GlassCard>

      <div className="space-y-4">
        {mounted && isCalculated && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="p-0 overflow-hidden border-primary/30 bg-primary/5">
              <div className="bg-primary/10 px-4 py-3 border-b border-primary/20 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Tu ROI Proyectado
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-muted-foreground">Pérdida mensual</span>
                  <span className="text-base font-bold text-destructive">-{perdidaMensual}€</span>
                </div>
                <div className="flex justify-between items-end border-t border-white/5 pt-2">
                  <span className="text-xs text-muted-foreground">ROI Estimado</span>
                  <span className="text-xl font-bold text-success">+{roi}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-muted-foreground">Pacientes</p>
                    <p className="text-sm font-semibold">{monthlyPatients}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-muted-foreground">Ticket</p>
                    <p className="text-sm font-semibold">{averageTicket}€</p>
                  </div>
                </div>
              </div>
              <div className="bg-primary/5 px-4 py-2 text-[10px] text-muted-foreground italic border-t border-white/5">
                Datos adjuntos a tu solicitud
              </div>
            </GlassCard>
          </motion.div>
        )}

        <GlassCard className="p-6">
          <h3 className="mb-4 font-semibold">Información de contacto</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <span className="text-muted-foreground">hola@clinvetia.com</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-primary" />
              <span className="text-muted-foreground">+34 900 123 456</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Lun-Vie: 9:00 - 18:00
                <br />
                Sáb: 10:00 - 14:00
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Barcelona, España
              </span>
            </li>
          </ul>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
          <h3 className="mb-2 font-semibold">¿Prefieres hablar ahora?</h3>
          <p className="mb-4 text-base text-muted-foreground">
            Schedule una llamada de 15 minutos con nuestro equipo.
          </p>
          <Button variant="secondary" className="w-full" asChild>
            <Link href="/demo">
              Reservar llamada
            </Link>
          </Button>
        </GlassCard>
      </div>

      {/* Dialog: Calculator prompt */}
      <Dialog 
        open={showCalculatorPrompt} 
        onOpenChange={setShowCalculatorPrompt}
      >
        <DialogContent 
          className="sm:max-w-md"
        >
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 border border-warning/30">
              <Info className="h-7 w-7 text-warning" />
            </div>
            <DialogTitle className="text-center text-xl">
              ¿Has usado la calculadora?
            </DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed">
              Si quieres una propuesta personalizada con el ROI real de tu clínica,
              te recomendamos usar primero la calculadora.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-warning/5 border border-warning/20 p-4 space-y-2">
            <p className="text-base font-medium text-foreground">
              Con la calculadora tu reunión será diferente:
            </p>
            <ul className="space-y-1.5 text-base text-muted-foreground">
              {[
                "Nos preparamos con tu perfil de clínica antes de la llamada",
                "Te mostramos proyecciones reales basadas en tu volumen",
                "La demo se adapta a tus casos de uso específicos",
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-success mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => router.back()}
            >
              Quedarme aquí
            </Button>
            <Button
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => router.push("/calculadora")}
            >
              Ir a la calculadora
              <Calculator className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              Hablemos de tu clínica
            </h1>
            <p className="text-lg text-muted-foreground">
              Nuestro equipo está listo para ayudarte a transformar tu gestión veterinaria.
            </p>
          </div>

          <ContactFormWithROI />
        </div>
      </div>
    </div>
  )
}
