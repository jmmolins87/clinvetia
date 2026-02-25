"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import {
  CalendarDays, ArrowRight, Sparkles, Moon, Phone, Clock,
  Bell, Brain, Heart,
  CheckCircle2, MessageSquare, Calculator, AlertCircle,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { CtaSection } from "@/components/marketing/cta-section"
import { BrandName } from "@/components/ui/brand-name"
import { MarketingCard } from "@/components/ui/marketing-card"
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper"

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
} as const

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } }
}

const PROBLEMA_CARDS = [
  { icon: Moon,  title: "Urgencias nocturnas perdidas", description: "Un dueño escribe a las 23h. Si tú no estás, alguien más la atiende." },
  { icon: Phone, title: "Recepción desbordada",         description: "Tu equipo atiende consultas... Cada interrupción suma minutos." },
  { icon: Clock, title: "Citas que se escapan",         description: "Tardas 2 horas en responder... Cliente perdido." },
  { icon: Bell,  title: "Recordatorios manuales",       description: "Todo requiere llamadas... depende de la memoria." }
] as const

const SOLUCION_FEATURES = [
  { title: "Comprende consultas veterinarias", description: "Interpreta síntomas, edad, raza y contexto" },
  { title: "Verifica agenda en tiempo real",    description: "Huecos disponibles, cirugías, bloques" },
  { title: "Agenda citas automáticamente",      description: "Sin intervención de tu equipo" },
  { title: "Recordatorios proactivos",          description: "Wapp, email, SMS automatizados" }
] as const

const FLUJO_PASOS = [
  { n: "01", title: "Dueño consulta", description: "WhatsApp 24/7" },
  { n: "02", title: "Sistema clasifica", description: "Triaje automático" },
  { n: "03", title: "Propone opciones", description: "Huecos disponibles" },
  { n: "04", title: "Confirma y recuerda", description: "Cita cerrada + recordatorio" }
] as const

const BENEFICIOS = [
  { icon: Brain, title: "Urgencias 24/7", description: "Nunca más una urgencia sin atender", color: "primary" },
  { icon: Phone, title: "Menos llamadas repetitivas", description: "El sistema hace el trabajo pesado", color: "secondary" },
  { icon: Heart, title: "Dueños tranquilos", description: "Respuesta inmediata, siempre", color: "primary" }
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

function AnimatedNumber({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (!isInView) return

    const isNegative = value.startsWith("+")
    const numStr = value.replace(/[+%]/g, "")
    const target = parseFloat(numStr)
    const hasDecimal = numStr.includes(".")

    let start: number | null = null
    const duration = 1500

    function animate(timestamp: number) {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target * eased
      const formatted = hasDecimal ? current.toFixed(1) : Math.round(current).toString()
      const prefix = isNegative ? "+" : ""
      setDisplayValue(`${prefix}${formatted}%`)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value])

  return <span ref={ref} className={className}>{displayValue}</span>
}

const SOLUCION_MOCK_STEPS = [
  { label: "Triaje IA", value: "Síntomas de dolor abdominal y anorexia. Posible obstrucción. Prioridad: Alta.", color: "text-secondary" },
  { label: "Agenda", value: "Hueco de urgencia con el Dr. García a las 16:30. ¿Te va bien?", color: "text-success" },
  { label: "", value: "✓ Cita confirmada para las 16:30. ¡Toby ya está en agenda!", color: "text-primary font-bold" }
] as const

function Section({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("relative overflow-hidden border-t border-white/8 px-4 py-20 sm:py-28", className)}>
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

export default function MarketingPage() {
  return (
    <>
      {/* HERO */}
      <Section id="hero" className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-0 border-t-0">
                <motion.div initial="initial" animate="animate" variants={staggerContainer} className="relative z-10 mx-auto max-w-6xl px-4 text-center">
                  <motion.div 
                    variants={fadeUp}
                    className="mb-8 hidden sm:flex justify-center"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full animate-pulse" />
                      <Image
                        src="/logo.png"
                        alt="Clinvetia Logo"
                        width={128}
                        height={128}
                        className="relative h-24 w-24 md:h-32 md:w-32 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
                      />
                    </div>
                  </motion.div>
        
                  <motion.div variants={fadeUp}><Badge variant="default" className="mb-6 gap-2 px-4 py-1.5"><Icon icon={Sparkles} size="sm" variant="primary" className="hidden sm:block" />Nueva Generación de IA Veterinaria</Badge></motion.div>
                  <motion.h1 variants={fadeUp} className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                    <SkeletonWrapper variant="primary">
                      <span className="text-foreground">Sistema de </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-green">Atención Inteligente</span>
                    </SkeletonWrapper>
                  </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 text-lg text-muted-foreground sm:text-xl">
            <SkeletonWrapper shape="text" lines={2} variant="secondary">
              No es un chatbot. Es un sistema que entiende consultas, clasifica urgencias, <br className="hidden sm:block" />verifica disponibilidad y agenda citas.
            </SkeletonWrapper>
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Button size="lg" asChild><Link href="/demo" className="flex items-center gap-2"><Icon icon={CalendarDays} size="sm" variant="primary" />Reservar Demo</Link></Button>
            <Button variant="secondary" size="lg" asChild><Link href="/calculadora" className="flex items-center gap-2"><Icon icon={Calculator} size="sm" variant="secondary" />Ver ROI</Link></Button>
          </motion.div>
        </motion.div>
      </Section>

      {/* PROBLEMA */}
      <Section id="problema">
        <div className="mx-auto max-w-6xl">
          <SectionHeader badge="El problema" title="¿Te resulta familiar?" subtitle="Estas situaciones ocurren cada día en clínicas veterinarias." />
          <div className="grid gap-6 sm:grid-cols-2">
            {PROBLEMA_CARDS.map((card, idx) => (
              <MarketingCard key={card.title} icon={card.icon} title={card.title} description={card.description} index={idx} iconClassName={idx % 2 === 0 ? "bg-secondary/10" : ""} />
            ))}
          </div>
        </div>
      </Section>

      {/* SOLUCIÓN */}
      <Section id="solucion">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <Badge variant="default" className="mb-4">La solución</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <SkeletonWrapper>
                Sistema de Atención Inteligente
              </SkeletonWrapper>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              <SkeletonWrapper shape="text" lines={2}>
                <BrandName /> no solo responde. Entiende el contexto, verifica tu disponibilidad y cierra la cita sin que nadie intervenga.
              </SkeletonWrapper>
            </p>
            <ul className="mt-8 space-y-4">
              {SOLUCION_FEATURES.map((feat) => (
                <li key={feat.title} className="flex items-start gap-3">
                  <Icon icon={CheckCircle2} size="sm" variant="primary" className="mt-0.5" />
                  <div><span className="font-medium">{feat.title}</span><p className="text-sm text-muted-foreground">{feat.description}</p></div>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5 backdrop-blur-lg">
              <div className="flex items-center gap-3"><Icon icon={AlertCircle} size="sm" variant="primary" /><p className="text-sm"><span className="font-bold text-primary">40%</span> de las consultas llegan fuera de horario. <BrandName /> las atiende <span className="font-bold text-foreground">inmediatamente</span>.</p></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative aspect-square rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-primary/10 p-8 backdrop-blur-xl overflow-hidden">
            {/* Background Decorator Icon */}
            <div className="absolute -top-10 -right-10 opacity-15 blur-3xl pointer-events-none">
              <Icon icon={MessageSquare} variant="primary" className="size-64" />
            </div>

            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
              <div className="mb-10">
                <p className="text-xl font-medium italic leading-relaxed text-foreground/90">
                  &ldquo;Hola, Toby no quiere comer desde ayer y noto que tiene la tripa muy hinchada y dura al tacto. Me preocupa.&rdquo;
                </p>
              </div>
              <div className="w-full max-w-sm space-y-4">
                {SOLUCION_MOCK_STEPS.map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-sm backdrop-blur-md"
                  >
                    {item.label && <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">{item.label}</span>}
                    <span className={cn("text-base", item.color)}>{item.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* FLUJO */}
      <Section id="flujo">
        <div className="mx-auto max-w-6xl">
          <SectionHeader badge="El flujo" title="Flujo sin fricciones" subtitle="Desde que el dueño contacta hasta que la cita está confirmada." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FLUJO_PASOS.map((step, idx) => (
              <motion.div key={step.n} {...fadeUp} transition={{ delay: idx * 0.1 }} className="relative">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 hover:border-white/20 transition-colors h-full">
                  <span className={cn("mb-4 block text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br", idx % 2 === 0 ? "from-primary to-neon-cyan" : "from-secondary to-destructive")}>{step.n}</span>
                  <h3 className="mb-1 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* BENEFICIOS */}
      <Section id="beneficios">
        <div className="mx-auto max-w-6xl text-center">
          <SectionHeader badge="Beneficios" title="Beneficios operativos" subtitle="Más tiempo para lo que importa: tus pacientes." />
          <div className="grid gap-6 sm:grid-cols-3 md:mx-auto md:max-w-3xl">
            {BENEFICIOS.map((ben, idx) => (
              <motion.div key={ben.title} {...fadeUp} transition={{ delay: idx * 0.1 }}>
                <div className={cn("mx-auto mb-4 inline-flex rounded-full bg-white/10 p-4", ben.color === "secondary" ? "bg-secondary/10" : "")}>
                  <Icon icon={ben.icon as LucideIcon} size="xl" variant={ben.color as "primary" | "secondary"} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{ben.title}</h3>
                <p className="text-sm text-muted-foreground">{ben.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ESCENARIOS */}
      <Section id="escenarios">
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeader badge="Casos reales" title="Escenarios de uso" subtitle="ClinvetIA se adapta a todo tipo de clínicas y necesidades." />
          <div className="flex flex-wrap justify-center gap-3">
            {ESCENARIOS.map((esc, idx) => (
              <motion.div key={esc.label} {...fadeUp} transition={{ delay: idx * 0.05 }}>
                <div className={cn("rounded-full border px-5 py-2.5 text-sm font-medium backdrop-blur-lg transition-all duration-300", esc.color === "secondary" ? "border-secondary/40 bg-secondary/10 text-secondary hover:bg-secondary/20" : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20")}>{esc.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ROI */}
      <Section id="roi">
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeader badge="El coste de no actuar" title="¿Cuántos clientes pierdes?" />
          <div className="mb-10 grid gap-6 sm:grid-cols-3">
            {ROI_DATOS.map((roi, idx) => (
              <motion.div key={roi.label} {...fadeUp} transition={{ delay: idx * 0.1 }} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-8">
                <div className={cn("mb-2 text-5xl font-bold", roi.color === "primary" && "text-primary", roi.color === "secondary" && "text-secondary", roi.color === "accent" && "text-success")}><AnimatedNumber value={roi.value} /></div>
                <div className="text-sm text-muted-foreground">{roi.label}</div>
              </motion.div>
            ))}
          </div>
          <motion.p {...fadeUp} className="mb-8 text-lg text-foreground">Tu equipo se enfoca en las mascotas, no en el teléfono.</motion.p>
          <div className="w-full mx-auto md:max-w-md">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/calculadora" className="flex items-center gap-2">
                <Icon icon={Calculator} size="sm" variant="secondary" />
                Calcular mi ROI
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      <CtaSection id="demo" badge="¿Hablamos?" title="Prueba ClinvetIA gratis" description="Configuramos tu clínica en 30 minutos. Sin compromiso." variant="glow" actions={[ { label: "Agendar Demo", href: "/demo", icon: CalendarDays }, { label: "Chatear", href: "#", variant: "ghost", icon: MessageSquare } ]} />
    </>
  )
}
