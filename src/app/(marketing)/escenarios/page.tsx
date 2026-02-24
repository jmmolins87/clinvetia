"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  CalendarDays,
  Calculator,
  MessageSquare,
  Cog,
  CheckCircle2,
  Moon,
  HeartPulse,
  Syringe,
  Stethoscope,
  Scissors,
  ClipboardList,
  Dog,
  LucideIcon,
} from "lucide-react"

import { CtaSection } from "@/components/marketing/cta-section"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

const casos = [
  {
    id: "urgencia-medianoche",
    titulo: "Urgencia de medianoche",
    subtitulo: "Vómitos y decaimiento",
    icono: Moon,
    descripcion: "Un dueño preocupado escribe a las 2 AM porque su perro no para de vomitar.",
    mensaje: '"Mi perro lleva vomitando toda la noche, ¿qué hago?"',
    sistema: "El sistema detecta la urgencia, hace preguntas clave y agenda una cita prioritaria.",
    resultado: "El perro es atendido a primera hora, evitando complicaciones.",
    imagen: "/use-cases/urgencia-nocturna.jpeg",
  },
  {
    id: "post-operatorio",
    titulo: "Post-operatorio",
    subtitulo: "Seguimiento de cirugía",
    icono: HeartPulse,
    descripcion: "Tras una cirugía, el sistema envía recordatorios para la medicación y seguimiento.",
    mensaje: '"¿Cuándo le toca el antiinflamatorio?"',
    sistema: "Envía recordatorios de medicación y agenda la revisión post-operatoria.",
    resultado: "Recuperación exitosa y el dueño se siente acompañado.",
    imagen: "/use-cases/post-operatorio.jpeg",
  },
  {
    id: "enfermedad-cronica",
    titulo: "Enfermedad crónica",
    subtitulo: "Control de diabetes",
    icono: Stethoscope,
    descripcion: "Un gato diabético necesita controles periódicos de glucosa.",
    mensaje: '"Se me ha olvidado la cita de este mes para el control de Tico."',
    sistema: "Agenda la cita de control y envía recordatorios automáticos.",
    resultado: "Control riguroso de la enfermedad y mejora de la calidad de vida.",
    imagen: "/use-cases/enfermedad-cronica.jpeg",
  },
  {
    id: "vacunacion",
    titulo: "Vacunación",
    subtitulo: "Recordatorio de vacunas",
    icono: Syringe,
    descripcion: "El sistema avisa de que a un cachorro le toca la siguiente dosis de la vacuna.",
    mensaje: '"¡No me acordaba! ¿Cuándo podemos ir?"',
    sistema: "Envía un recordatorio y ofrece varias opciones de cita para la vacunación.",
    resultado: "El cachorro completa su pauta de vacunación a tiempo.",
    imagen: "/use-cases/recordatorio-vac.jpeg",
  },
  {
    id: "deteccion-temprana",
    titulo: "Consulta Preventiva",
    subtitulo: "Detección Temprana",
    icono: Stethoscope,
    descripcion: "En una revisión anual, se detecta un bulto y se recomienda ecografía.",
    mensaje: '"Le noté un bultito al perro, ¿debería preocuparme?"',
    sistema: "Agenda una consulta para evaluación y posible ecografía.",
    resultado: "Diagnóstico temprano y tratamiento eficaz.",
    imagen: "/use-cases/deteccion-temprana.jpeg",
  },
  {
    id: "multiples-servicios",
    titulo: "Múltiples Servicios",
    subtitulo: "Peluquería y Consulta",
    icono: Scissors,
    descripcion: "Un cliente agenda peluquería, y el sistema detecta que la vacuna está próxima.",
    mensaje: '"Quiero cita para peluquería."',
    sistema: "Ofrece añadir la vacunación en la misma visita.",
    resultado: "Ahorro de tiempo para el cliente y servicio más completo.",
    imagen: "/use-cases/peluqueria-consulta.jpeg",
  },
  {
    id: "comunicacion-proactiva",
    titulo: "Análisis de Resultados",
    subtitulo: "Comunicación Proactiva",
    icono: ClipboardList,
    descripcion: "Los resultados de un análisis llegan, y el sistema avisa al dueño.",
    mensaje: '"¿Están ya los resultados de las analíticas?"',
    sistema: "Notifica al dueño y agenda una llamada para explicar los resultados.",
    resultado: "Dueño informado y tranquilo, sin necesidad de llamar a la clínica.",
    imagen: "/use-cases/comun-proactiva.jpeg",
  },
  {
    id: "nuevo-cachorro",
    titulo: "Primera Visita",
    subtitulo: "Nuevo Cachorro",
    icono: Dog,
    descripcion: "Un nuevo cliente pregunta por la primera visita de su cachorro.",
    mensaje: '"Hemos adoptado un cachorro, ¿cuándo tenemos que ir?"',
    sistema: "Guía sobre la primera visita, vacunas y agenda la cita.",
    resultado: "Cliente fidelizado desde el primer día.",
    imagen: "/use-cases/cachorro.jpeg",
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
} as const

// ── Sub-componentes Reutilizables ─────────────────────────────────────────────

function DetailBox({ label, text, icon: Icon, className, fullWidth }: { 
  label?: string, 
  text: string, 
  icon?: LucideIcon, 
  className?: string,
  fullWidth?: boolean
}) {
  return (
    <div className={cn(
      "rounded-xl border p-3",
      fullWidth ? "col-span-2" : "",
      className
    )}>
      {label && (
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon className="h-4 w-4" />}
          <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
        </div>
      )}
      <p className={cn("text-sm leading-relaxed", !label ? "italic" : "")}>{text}</p>
    </div>
  )
}

export default function EscenariosPage() {
  const [selectedCaso, setSelectedCaso] = useState<typeof casos[0] | null>(null)

  return (
    <div className="relative">
      <Dialog open={!!selectedCaso} onOpenChange={(open) => !open && setSelectedCaso(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
          {selectedCaso && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-primary">
                  <selectedCaso.icono className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedCaso.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCaso.subtitulo}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DetailBox label="Problema" text={selectedCaso.descripcion} className="col-span-2 border-destructive/30 bg-destructive/10 text-destructive" />
                <DetailBox label="Mensaje" text={selectedCaso.mensaje} icon={MessageSquare} className="border-white/10 bg-white/5 text-primary" />
                <DetailBox label="Sistema" text={selectedCaso.sistema} icon={Cog} className="border-white/10 bg-white/5 text-secondary" />
                <DetailBox label="Resultado" text={selectedCaso.resultado} icon={CheckCircle2} className="col-span-2 border-success/30 bg-success/10 text-success" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <section className="pt-16 pb-8 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeUp}>
            <Badge variant="secondary" className="mb-6">Casos de uso reales</Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Situaciones veterinarias <span className="text-gradient-primary">reales</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">El sistema se adapta al ritmo de tu clínica veterinaria.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 pb-24 md:py-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {casos.map((caso, index) => (
              <motion.div key={caso.id} {...fadeUp} transition={{ delay: index * 0.05 }}>
                {/* Cabecera Tarjeta */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-primary">
                    <caso.icono className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{caso.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{caso.subtitulo}</p>
                  </div>
                </div>

                {/* Imagen y Overlay */}
                <div 
                  className="group relative aspect-video overflow-hidden rounded-2xl bg-white/5 border border-white/5 cursor-pointer md:cursor-auto"
                  onClick={() => setSelectedCaso(caso)}
                >
                  <Image src={caso.imagen} alt={caso.titulo} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-md opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 pointer-events-none md:pointer-events-auto">
                    <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                      <DetailBox label="Problema" text={caso.descripcion} className="border-destructive/30 bg-destructive/10 text-destructive" fullWidth />
                      <DetailBox label="Mensaje" text={caso.mensaje} icon={MessageSquare} className="border-white/10 bg-white/5 text-primary" />
                      <DetailBox label="Sistema" text={caso.sistema} icon={Cog} className="border-white/10 bg-white/5 text-secondary" />
                      <DetailBox label="Resultado" text={caso.resultado} icon={CheckCircle2} className="border-success/30 bg-success/10 text-success" fullWidth />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        title="¿Tu clínica vive alguna de estas situaciones?"
        description="Descubre cómo ClinvetIA puede transformar la atención de tu clínica."
        actions={[
          { label: "Agendar Demo", href: "/contacto", icon: CalendarDays },
          { label: "Calcular ROI", href: "/calculadora", variant: "secondary", icon: Calculator },
        ]}
        className="pb-8"
      />
    </div>
  )
}
