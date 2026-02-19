"use client"

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
} from "lucide-react"

import { CtaSection } from "@/components/marketing/cta-section"

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
}

export default function EscenariosPage() {
  return (
    <div className="relative">
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SIMPLE
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Situaciones veterinarias{" "}
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                reales
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              El sistema se adapta al ritmo de tu clínica veterinaria.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          GRID DE CASOS DE USO
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 pb-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {casos.map((caso, index) => (
              <motion.div
                key={caso.id}
                {...fadeUp}
                transition={{ delay: index * 0.05 }}
              >
                {/* Título con icono - ANTES de la imagen */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 border border-primary/30">
                    <caso.icono className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{caso.titulo}</h3>
                    <p className="text-base text-muted-foreground">{caso.subtitulo}</p>
                  </div>
                </div>

                {/* Imagen con overlay en hover */}
                <div className="group relative w-full aspect-video overflow-hidden rounded-xl bg-white/5">
                  <Image
                    src={caso.imagen}
                    alt={caso.titulo}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  {/* Overlay con blur que aparece en hover */}
                  <div className="absolute inset-0 bg-background/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                      {/* Problema */}
                      <div className="col-span-2 rounded-xl border-2 border-destructive/50 bg-destructive/10 p-3">
                        <p className="text-base text-destructive font-semibold mb-1">PROBLEMA</p>
                        <p className="text-base text-foreground">{caso.descripcion}</p>
                      </div>

                      {/* Mensaje del dueño */}
                      <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <p className="text-base text-primary font-semibold">Mensaje</p>
                        </div>
                        <p className="text-base text-foreground italic">{caso.mensaje}</p>
                      </div>

                      {/* Lo que hace el sistema */}
                      <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Cog className="h-4 w-4 text-secondary" />
                          <p className="text-base text-secondary font-semibold">Sistema</p>
                        </div>
                        <p className="text-base text-foreground/90">{caso.sistema}</p>
                      </div>

                      {/* Resultado */}
                      <div className="col-span-2 rounded-xl border-2 border-success/50 bg-success/10 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <p className="text-base text-success font-semibold">RESULTADO</p>
                        </div>
                        <p className="text-base text-foreground/90">{caso.resultado}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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
          { label: "Calcular mi ROI", href: "/calculadora", variant: "secondary", icon: Calculator },
        ]}
        className="pb-8"
      />
    </div>
  )
}
