"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  CalendarDays, ArrowRight, Sparkles, Moon, Phone, Clock,
  Bell, Brain, Heart,
  CheckCircle2, MessageSquare, Calculator, AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CtaSection } from "@/components/marketing/cta-section"
import { BrandName } from "@/components/ui/brand-name"

// Animaciones reutilizables
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } }
}

// Datos de secciones
const PROBLEMA_CARDS = [
  {
    icon: Moon,
    title: "Urgencias nocturnas perdidas",
    description: "Un dueño escribe a las 23h. Si tú no estás, alguien más la atiende."
  },
  {
    icon: Phone,
    title: "Recepción desbordada",
    description: "Tu equipo atiende consultas... Cada interrupción suma minutos."
  },
  {
    icon: Clock,
    title: "Citas que se escapan",
    description: "Tardas 2 horas en responder... Cliente perdido."
  },
  {
    icon: Bell,
    title: "Recordatorios manuales",
    description: "Todo requiere llamadas... depende de la memoria."
  }
] as const

const SOLUCION_FEATURES = [
  { title: "Comprende consultas veterinarias", description: "Interpreta síntomas, edad, raza y contexto" },
  { title: "Verifica agenda en tiempo real", description: "Huecos disponibles, cirugías, bloques" },
  { title: "Agenda citas automáticamente", description: "Sin intervención de tu equipo" },
  { title: "Recordatorios proactivos", description: "Wapp, email, SMS automatizados" }
] as const

const FLUJO_PASOS = [
  { n: "01", title: "Dueño consulta", description: "WhatsApp 24/7" },
  { n: "02", title: "Sistema clasifica", description: "Triaje automático" },
  { n: "03", title: "Propone opciones", description: "Huecos disponibles" },
  { n: "04", title: "Confirma y recuerda", description: "Cita cerrada + recordatorio" }
] as const

const BENEFICIOS = [
  { title: "Urgencias 24/7", description: "Nunca más una urgencia sin atender" },
  { title: "Menos llamadas repetitivas", description: "El sistema hace el trabajo pesado" },
  { title: "Dueños tranquilos", description: "Respuesta inmediata, siempre" }
] as const

const ESCENARIOS = [
  { label: "Urgencias Nocturnas", color: "secondary" as const },
  { label: "Medicina Preventiva", color: "primary" as const },
  { label: "Tratamientos Crónicos", color: "secondary" as const },
  { label: "Múltiples Servicios", color: "primary" as const }
] as const

const ROI_DATOS = [
  { value: "80%", label: "esperan respuesta inmediata", color: "primary" as const },
  { value: "67%", label: "se van tras 24h", color: "secondary" as const },
  { value: "+35%", label: "aumento en consultas", color: "accent" as const }
] as const

// Componentes helper
function Section({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("relative border-t border-white/8 px-4 py-20 sm:py-28", className)}>
      {children}
    </section>
  )
}

function SectionHeader({ badge, title, subtitle }: { badge?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-12 max-w-2xl mx-auto text-center">
      {badge && <Badge variant="secondary" className="mb-4">{badge}</Badge>}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

function BackgroundGlow({ className, color = "primary" }: { className?: string; color?: "primary" | "secondary" | "accent" }) {
  const colors = {
    primary: "bg-primary/10",
    secondary: "bg-secondary/10",
    accent: "bg-success/10"
  }
  return (
    <div aria-hidden className={cn("pointer-events-none absolute -z-10 rounded-full blur-[120px]", colors[color], className)} />
  )
}

// Page principal
export default function MarketingPage() {
  return (
    <>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <Section id="hero" className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-0">
        <BackgroundGlow className="left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2" color="primary" />
        <BackgroundGlow className="left-[70%] top-[60%] h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2" color="secondary" />
        
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="relative z-10 mx-auto max-w-6xl px-4 text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="default" className="mb-6 gap-2 px-4 py-1.5">
              <Sparkles className="size-3" />
              Nueva Generación de IA Veterinaria
            </Badge>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-foreground">Sistema de </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-green">
              Atención Inteligente
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-lg text-muted-foreground sm:text-xl">
            No es un chatbot. Es un sistema que entiende consultas, clasifica urgencias,
            <br className="hidden sm:block" />
            verifica disponibilidad y agenda citas.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="#demo" className="flex items-center gap-2">
                <CalendarDays className="size-5" />
                Reservar Demo
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="#roi" className="flex items-center gap-2">
                Ver ROI
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </Section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECCIÓN: PROBLEMA
      ═══════════════════════════════════════════════════════════════════════ */}
      <Section id="problema">
        <BackgroundGlow className="left-0 top-1/2 h-[450px] w-[450px] -translate-y-1/2" color="secondary" />
        
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            badge="El problema"
            title="¿Te resulta familiar?"
            subtitle="Estas situaciones ocurren cada día en clínicas veterinarias."
          />

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2"
          >
            {PROBLEMA_CARDS.map(({ icon: Icon, title, description }, idx) => (
              <motion.div key={title} variants={fadeUp}>
                <Card className={cn(
                  "h-full border-white/10 bg-white/5 backdrop-blur-lg",
                  "hover:border-white/20 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]",
                  "transition-all duration-300"
                )}>
                  <CardContent className="p-6 flex gap-4">
                    <div className={cn(
                      "shrink-0 inline-flex rounded-full bg-white/10 p-3",
                      idx % 2 === 0 ? "bg-secondary/10" : ""
                    )}>
                      <Icon className={cn("size-6", idx % 2 === 0 ? "text-secondary" : "text-primary")} />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECCIÓN: SOLUCIÓN
      ═══════════════════════════════════════════════════════════════════════ */}
      <Section id="solucion">
        <BackgroundGlow className="right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2" color="accent" />
        
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="default" className="mb-4">La solución</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Sistema de Atención Inteligente
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              <BrandName /> no solo responde. Entiende el contexto, verifica tu disponibilidad
              y cierra la cita sin que nadie intervenga.
            </p>

            <ul className="mt-8 space-y-4">
              {SOLUCION_FEATURES.map(({ title, description }) => (
                <li key={title} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <span className="font-medium">{title}</span>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5 backdrop-blur-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-5 text-primary shrink-0" />
                <p className="text-sm">
                  <span className="font-bold text-primary">40%</span> de las consultas llegan fuera de horario.
                  <BrandName /> las atende <span className="font-bold text-foreground">inmediatamente</span>.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative aspect-square rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-primary/10 p-8 backdrop-blur-xl"
          >
            <div className="absolute inset-8 flex flex-col items-center justify-center">
              <div className="mb-8 flex items-center gap-3">
                <MessageSquare className="size-6 text-primary" />
                <span className="text-lg font-medium">&ldquo;Mi perro no come desde ayer, tiene la tripa dura&rdquo;</span>
              </div>
              
              <div className="w-full max-w-xs space-y-3">
                <div className="rounded-xl bg-white/10 border border-white/10 p-3 text-sm">
                  <span className="text-muted-foreground">Análisis: </span>
                  <span className="text-secondary font-medium">Posible obstrucción digestiva - Urgencia media</span>
                </div>
                <div className="rounded-xl bg-success/10 border border-success/30 p-3 text-sm">
                  <span className="text-muted-foreground">Cita propuesta: </span>
                  <span className="text-success font-medium">Hoy 16:30 - Dr. García</span>
                </div>
                <div className="rounded-xl bg-primary/10 border border-primary/30 p-3 text-sm text-center">
                  <span className="text-primary font-medium">✓ Cita confirmada</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECCIÓN: FLUJO
      ═══════════════════════════════════════════════════════════════════════ */}
      <Section id="flujo">
        <BackgroundGlow className="left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2" color="primary" />
        
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            badge="El flujo"
            title="Flujo sin fricciones"
            subtitle="Desde que el dueño contacta hasta que la cita está confirmada."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FLUJO_PASOS.map(({ n, title, description }, idx) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative"
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 hover:border-white/20 transition-colors">
                  <span className={cn(
                    "mb-4 block text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br",
                    idx % 2 === 0 ? "from-primary to-neon-cyan" : "from-secondary to-destructive"
                  )}>
                    {n}
                  </span>
                  <h3 className="mb-1 text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECCIÓN: BENEFICIOS
      ═══════════════════════════════════════════════════════════════════════ */}
      <Section id="beneficios">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            badge="Beneficios"
            title="Beneficios operativos"
            subtitle="Más tiempo para lo que importa: tus pacientes."
          />

          <div className="grid gap-6 sm:grid-cols-3">
            {BENEFICIOS.map(({ title, description }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className={cn(
                  "mx-auto mb-4 inline-flex rounded-full bg-white/10 p-4",
                  idx === 1 ? "bg-secondary/10" : ""
                )}>
                  {idx === 0 && <Brain className="size-8 text-primary" />}
                  {idx === 1 && <Phone className="size-8 text-secondary" />}
                  {idx === 2 && <Heart className="size-8 text-primary" />}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECCIÓN: ESCENARIOS
      ═══════════════════════════════════════════════════════════════════════ */}
      <Section id="escenarios">
        <BackgroundGlow className="right-0 top-1/2 h-[350px] w-[350px] -translate-y-1/2" color="secondary" />
        
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            badge="Casos reales"
            title="Escenarios de uso"
            subtitle="ClinvetIA se adapta a todo tipo de clínicas y necesidades."
          />

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-3"
          >
            {ESCENARIOS.map(({ label, color }) => (
              <motion.div key={label} variants={fadeUp}>
                <div className={cn(
                  "cursor-pointer rounded-full border px-5 py-2.5 text-sm font-medium",
                  "backdrop-blur-lg transition-all duration-300",
                  color === "secondary"
                    ? "border-secondary/40 bg-secondary/10 text-secondary hover:bg-secondary/20"
                    : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                )}>
                  {label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECCIÓN: ROI
      ═══════════════════════════════════════════════════════════════════════ */}
      <Section id="roi">
        <BackgroundGlow className="left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2" color="accent" />
        <BackgroundGlow className="left-[15%] top-[30%] h-[250px] w-[250px]" color="secondary" />
        
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeader
            badge="El coste de no actuar"
            title="¿Cuántos clientes pierdes?"
          />

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-10 grid gap-6 sm:grid-cols-3"
          >
            {ROI_DATOS.map(({ value, label, color }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-8"
              >
                <div className={cn(
                  "mb-2 text-5xl font-bold",
                  color === "primary" && "text-primary",
                  color === "secondary" && "text-secondary",
                  color === "accent" && "text-success"
                )}>
                  {value}
                </div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mb-8 text-lg text-foreground"
          >
            Tu equipo se enfoca en las mascotas, no en el teléfono.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" variant="secondary" asChild>
              <Link href="#demo" className="flex items-center gap-2">
                <Calculator className="size-5" />
                Calcular mi ROI
              </Link>
            </Button>
          </motion.div>
        </div>
      </Section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECCIÓN: DEMO CTA FINAL
      ═══════════════════════════════════════════════════════════════════════ */}
      <CtaSection
        id="demo"
        badge="¿Hablamos?"
        title="Prueba ClinvetIA gratis"
        description="Configuramos tu clínica en 30 minutos. Sin compromiso."
        variant="glow"
        actions={[
          { label: "Agendar Demo", href: "mailto:hola@clinvetia.com", icon: CalendarDays },
          { label: "Chatear", href: "#", variant: "ghost", icon: MessageSquare },
        ]}
      />

    </>
  )
}
