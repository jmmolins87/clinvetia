"use client"

import { motion } from "framer-motion"
import {
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Database,
  Calendar,
  FileText,
  ShieldCheck,
  Zap,
  Clock,
  Heart,
  HelpCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/GlassCard"
import { Icon } from "@/components/ui/icon"
import { CtaSection } from "@/components/marketing/cta-section"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { CalendarDays, Calculator } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const steps = [
  {
    title: "Atender y clasificar",
    text: "Responde consultas sobre mascotas, identifica si es urgencia o rutina, y mantiene el tono profesional veterinario.",
    icon: MessageSquare,
    color: "primary",
  },
  {
    title: "Recoger información clave",
    text: "Pregunta lo esencial: síntomas, mascota (especie, edad), historial de vacunas, y disponibilidad del dueño.",
    icon: Database,
    color: "secondary",
  },
  {
    title: "Proponer cita veterinaria",
    text: "Sugiere cita urgente, vacunación, revisión o cirugía según el caso, siempre con confirmación.",
    icon: Calendar,
    color: "accent",
  },
  {
    title: "Confirmar y recordar",
    text: "Envía confirmación con detalles (ayuno si aplica, qué traer) y programa recordatorio 24h antes.",
    icon: CheckCircle2,
    color: "primary",
  },
]

const dataNeeded = [
  {
    title: "Síntomas y motivo",
    text: "Para clasificar urgencia (vómitos, accidentes) vs. rutina (vacunas, baño).",
    icon: Zap,
  },
  {
    title: "Datos de la mascota",
    text: "Especie, raza, edad, peso, alergias conocidas y historial de vacunas.",
    icon: Heart,
  },
  {
    title: "Disponibilidad del dueño",
    text: "Para proponer horarios compatibles con el tipo de consulta.",
    icon: Clock,
  },
  {
    title: "Confirmaciones previas",
    text: "Ayuno, medicación actual, comportamiento de la mascota antes de agendar cirugía.",
    icon: FileText,
  },
]

const faqs = [
  {
    q: "¿El sistema diagnostica a las mascotas?",
    a: "No. El sistema recoge síntomas, clasifica urgencias y agenda cita con el veterinario. No sustituye el diagnóstico profesional.",
  },
  {
    q: "¿Qué pasa con urgencias reales?",
    a: "Las urgencias graves se priorizan y derivan inmediatamente. El sistema identifica síntomas críticos y propone cita urgente o deriva a atención 24h.",
  },
  {
    q: "¿Se adapta al protocolo de mi clínica?",
    a: "Sí. Defines tu protocolo de triaje, preguntas clave por tipo de consulta (urgencia, vacuna, cirugía) y tono de comunicación.",
  },
  {
    q: "¿Funciona para recordatorios de vacunas?",
    a: "Sí. Envía recordatorios automáticos basados en el calendario de vacunación y desparasitación de cada mascota.",
  },
  {
    q: "¿Puedo revisar las conversaciones?",
    a: "Sí. Tienes visibilidad completa y puedes intervenir en cualquier momento, especialmente en casos sensibles.",
  },
  {
    q: "¿Sirve para clínicas pequeñas?",
    a: "Sí. Está diseñado para veterinarias independientes donde cada consulta cuenta y el equipo está saturado.",
  },
]

export default function ComoFuncionaPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Blobs de fondo */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-primary/15 blur-[130px]"
          animate={{ scale: [1, 1.1, 0.95, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -right-1/4 h-[500px] w-[500px] rounded-full bg-secondary/10 blur-[110px]"
          animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.3, 0.5, 0.3] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <Badge variant="default" className="mb-6">
                Cómo funciona
              </Badge>
            </motion.div>
            <motion.h1
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="mb-6 text-4xl font-bold tracking-tight md:text-6xl"
            >
              De consulta a cita, con{" "}
              <span className="text-gradient-primary">
                criterio veterinario
              </span>
            </motion.h1>
            <motion.p
              {...fadeUp}
              transition={{ delay: 0.3 }}
              className="mx-auto max-w-2xl text-lg text-muted-foreground"
            >
              Un flujo claro para atender consultas sobre mascotas, clasificar
              urgencias y agendar citas sin sobrecargar al equipo.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── PASOS ─────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/8">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              El flujo en 4 pasos
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, idx) => {
              const bgColors = {
                primary: "bg-primary/10 border-primary/30",
                secondary: "bg-secondary/10 border-secondary/30",
                accent: "bg-accent/10 border-accent/30",
              };
              return (
                <motion.div
                  key={step.title}
                  {...fadeUp}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  <GlassCard className="h-full p-6 space-y-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl border",
                          bgColors[step.color as keyof typeof bgColors],
                        )}
                      >
                        <Icon
                          icon={step.icon}
                          variant={step.color as any}
                          size="lg"
                        />
                      </div>
                      <span className="text-4xl font-bold opacity-10">
                        {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {step.text}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INFORMACIÓN ────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/8 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div {...fadeUp}>
              <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
                Qué información recoge y por qué
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Solo lo necesario para atender bien a la mascota y optimizar la
                agenda de tu clínica.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {dataNeeded.map((item, idx) => (
                  <GlassCard key={item.title} className="p-5 space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                      <Icon icon={item.icon} variant="primary" size="sm" />
                    </div>
                    <h4 className="font-bold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </GlassCard>
                ))}
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <GlassCard className="p-8 border-primary/30 bg-primary/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Control y supervisión</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "El veterinario decide qué casos revisar y cuándo intervenir directamente.",
                    "Síntomas graves o casos complejos se derivan inmediatamente.",
                    "El sistema no diagnostica: guía al dueño y agenda con el profesional.",
                    "El tono se adapta a dueños preocupados, con empatía y profesionalidad.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-base text-muted-foreground">{item}</p>
                    </li>
                  ))}
                </ul>
              </GlassCard>

              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="font-bold text-destructive uppercase tracking-wider text-sm">
                    Aviso Importante
                  </p>
                </div>
                <p className="text-lg font-medium text-foreground">
                  Cada consulta sin responder es un cliente que se va a otra
                  clínica.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCIA ────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/8">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
              WhatsApp y agenda, sin fricción
            </h2>
            <p className="text-lg text-muted-foreground">
              El flujo está diseñado para conversaciones reales con dueños de
              mascotas y para encajar con tu forma de organizar la clínica.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard className="p-8 space-y-4">
              <h3 className="text-xl font-bold text-primary">
                Para la clínica
              </h3>
              <ul className="space-y-3">
                {[
                  "Agenda optimizada según tipo de servicio.",
                  "Triaje automático antes de que el cliente llegue.",
                  "Menos llamadas repetitivas en recepción.",
                  "Historial de conversación disponible siempre.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard className="p-8 space-y-4">
              <h3 className="text-xl font-bold text-secondary">
                Para el dueño
              </h3>
              <ul className="space-y-3">
                {[
                  "Respuestas inmediatas 24/7.",
                  "Lenguaje claro y cercano.",
                  "Orientación sobre qué hacer ante síntomas.",
                  "Tranquilidad de atención profesional.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/8 bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-center gap-3 mb-12">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Preguntas frecuentes
              </h2>
            </div>
            <GlassCard className="p-2">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`faq-${idx}`}
                    last={idx === faqs.length - 1}
                  >
                    <AccordionTrigger className="text-base font-medium px-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-base px-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════════════════════════ */}
      <CtaSection
        title="¿Tu clínica vive alguna de estas situaciones?"
        description="Descubre cómo ClinvetIA puede transformar la atención de tu clínica."
        actions={[
          { label: "Reservar demo", href: "/demo", icon: CalendarDays },
          {
            label: "Calcular mi ROI",
            href: "/calculadora",
            variant: "secondary",
            icon: Calculator,
          },
        ]}
        className="pb-8"
      />
    </div>
  );
}
