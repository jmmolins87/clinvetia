"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  MessageCircle,
  AlertTriangle,
  ClipboardList,
  CalendarClock,
  BellRing,
  CheckCircle2,
  ArrowRight,
  CalendarDays,
  Calculator,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/GlassCard"
import { CtaSection } from "@/components/marketing/cta-section"
import { BrandName } from "@/components/ui/brand-name"
import { MarketingCard } from "@/components/ui/marketing-card"
import { Icon } from "@/components/ui/icon"

const features = [
  {
    icon: MessageCircle,
    title: "Consulta Inteligente",
    description: "Responde consultas sobre síntomas, vacunas y disponibilidad 24/7 en lenguaje natural.",
  },
  {
    icon: AlertTriangle,
    title: "Clasificación de Urgencias",
    description: "Diferencia de síntomas, accidentes y emergencias de consultas rutinarias.",
  },
  {
    icon: ClipboardList,
    title: "Recogida de Datos",
    description: "Recoge información clave: mascota, síntomas, historial y disponibilidad.",
  },
  {
    icon: CalendarClock,
    title: "Propuesta de Cita",
    description: "Sugiere el tipo de cita correcto: urgencia, vacunación, cirugía o revisión.",
  },
  {
    icon: BellRing,
    title: "Recordatorios Automáticos",
    description: "Envía recordatorios por WhatsApp o email para reducir ausencias.",
  },
]

const flujoPasos = [
  {
    numero: "01",
    titulo: "Consulta del dueño",
    descripcion: "El dueño contacta por WhatsApp o web con su duda o necesidad.",
  },
  {
    numero: "02",
    titulo: "Clasificación IA",
    descripcion: "ClinvetIA analiza el mensaje y clasifica: urgencia, sintomatología o consulta general.",
  },
  {
    numero: "03",
    titulo: "Propuesta de cita",
    descripcion: "El sistema propone la cita más adecuada según disponibilidad y tipo de atención.",
  },
  {
    numero: "04",
    titulo: "Confirmación",
    descripcion: "El dueño confirma y la cita se registra automáticamente en el sistema.",
  },
]

const seguridadItems = [
  { text: "Identifica síntomas graves y deriva urgencias", icon: AlertTriangle },
  { text: "No diagnostica: guía y propone cita", icon: Stethoscope },
  { text: "Confirma datos antes de agendar", icon: CheckCircle2 },
  { text: "Mantiene tono profesional siempre", icon: ShieldCheck },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
} as const

export default function SolucionPage() {
  return (
    <div className="relative">
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <Badge variant="secondary" className="mb-6">
                Inteligencia Artificial Veterinaria
              </Badge>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
            >
              <span className="text-gradient-primary">Sistema de Atención</span>
              <br />
              <span className="text-gradient-accent">Inteligente para Veterinarias</span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ delay: 0.3 }}
              className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              Atiende consultas sobre mascotas con criterio veterinario, clasifica urgencias y agenda citas sin fricción.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 md:mx-auto md:max-w-lg"
            >
              <Button size="lg" asChild>
                <Link href="/contacto" className="gap-2">
                  <Icon icon={CalendarDays} size="sm" variant="primary" />
                  Reservar demo
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/calculadora" className="gap-2">
                  <Icon icon={Calculator} size="sm" variant="secondary" />
                  Ver ROI
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION: QUÉ ES (CONCEPTO)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <motion.div {...fadeUp}>
              <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl text-center">
                ¿Qué es <BrandName />?
              </h2>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <GlassCard className="p-8 md:p-10 text-center">
                <p className="text-base text-muted-foreground leading-relaxed">
                  Un sistema que <span className="text-foreground font-medium">atiende consultas de dueños sobre sus mascotas en lenguaje natural</span>, con tono profesional veterinario. Responde dudas sobre síntomas, vacunas, medicación y disponibilidad, mientras clasifica urgencias y gestiona la agenda.
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xl font-semibold text-destructive">
                    Cada consulta sin responder es un cliente que se va a otra clínica.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION: QUÉ HACE (GRID DE FEATURES)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              ¿Qué hace <BrandName />?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Automatiza la atención al cliente mientras mantienes el control y la calidad veterinaria.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <MarketingCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION: FLUJO SIN FRICCIONES (TIMELINE)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Flujo sin fricciones
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Desde la consulta del dueño hasta la cita confirmada, sin intervención manual.
            </p>
          </motion.div>

          <div className="relative">
            <div className="grid gap-6 md:max-w-6xl md:grid-cols-2 md:mx-auto">
              {flujoPasos.map((paso, index) => (
                <motion.div
                  key={paso.numero}
                  {...fadeUp}
                  transition={{ delay: 0.1 + index * 0.15 }}
                  className="relative"
                >
                  <GlassCard className="p-6 h-full border-white/10 hover:border-primary/30 transition-colors">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-background">
                      {paso.numero}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{paso.titulo}</h3>
                    <p className="text-base text-muted-foreground">{paso.descripcion}</p>
                  </GlassCard>

                  {/* Arrow connector (mobile/tablet) */}
                  {index < flujoPasos.length - 1 && (
                    <div className="lg:hidden flex justify-center my-2">
                      <Icon icon={ArrowRight} size="sm" variant="muted" className="opacity-30" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION: SEGURIDAD Y CONTROL (GRID 2x2)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Control, seguridad y criterio <span className="text-primary">veterinario</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              <BrandName /> trabaja dentro de los límites seguros de la atención veterinaria.
            </p>
          </motion.div>

          <div className="mx-auto max-w-3xl">
            <div className="grid gap-4 md:grid-cols-2 mt-2">
              {seguridadItems.map((item, index) => (
                <motion.div
                  key={item.text}
                  {...fadeUp}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <GlassCard className="p-6 flex items-start gap-4 border-white/10 hover:border-primary/20 transition-colors">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 text-primary mb-2">
                      <Icon icon={item.icon} size="lg" variant="primary" />
                    </div>
                    <span className="text-base font-semibold leading-tight pt-1">{item.text}</span>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════════════════════════ */}
      <CtaSection
        title="¿Listo para transformar la atención de tu clínica?"
        description="Reserva una demo personalizada y descubre cómo ClinvetIA puede aumentar tu capacidad de atención."
        actions={[
          { label: "Agendar Demo", href: "/contacto", icon: CalendarDays },
          { label: "Ver ROI", href: "/calculadora", variant: "secondary", icon: Calculator },
        ]}
      />
    </div>
  )
}
