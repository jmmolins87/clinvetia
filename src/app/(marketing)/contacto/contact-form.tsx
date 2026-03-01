"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Send, Mail, Phone, MapPin, Clock, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/GlassCard"
import { Icon } from "@/components/ui/icon"

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

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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
          <Icon icon={CheckCircle2} size="2xl" variant="primary" />
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
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
            <div className="space-y-3">
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
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
            <div className="space-y-3">
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
          </div>

          <div className="space-y-3">
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
                <Icon icon={Send} size="sm" variant="primary" />
                Enviar mensaje
              </>
            )}
          </Button>
        </form>
      </GlassCard>

      <div className="space-y-4">
        <GlassCard className="p-6">
          <h3 className="mb-4 font-semibold">Información de contacto</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Icon icon={Mail} size="sm" variant="primary" className="mt-0.5" />
              <span className="text-muted-foreground">hola@clinvetia.com</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon={Phone} size="sm" variant="primary" className="mt-0.5" />
              <span className="text-muted-foreground">+34 900 123 456</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon={Clock} size="sm" variant="primary" className="mt-0.5" />
              <span className="text-muted-foreground">
                Lun-Vie: 9:00 - 18:00
                <br />
                Sáb: 10:00 - 14:00
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon={MapPin} size="sm" variant="primary" className="mt-0.5" />
              <span className="text-muted-foreground">
                Barcelona, España
              </span>
            </li>
          </ul>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
          <h3 className="mb-2 font-semibold">¿Prefieres hablar ahora?</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Schedule una llamada de 15 minutos con nuestro equipo.
          </p>
          <Button variant="secondary" className="w-full" asChild>
            <Link href="/demo">
              Reservar llamada
            </Link>
          </Button>
        </GlassCard>
      </div>
    </div>
  )
}
