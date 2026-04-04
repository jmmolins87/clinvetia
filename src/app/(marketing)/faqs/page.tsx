import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/GlassCard"
import { SeoLinkCluster } from "@/components/marketing/seo-link-cluster"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clinvetia.com"

const FAQS = [
  {
    question: "Qué es Clinvetia?",
    answer:
      "Clinvetia es un sistema de automatización con IA para clínicas veterinarias que capta leads, responde consultas y ayuda a cerrar más citas.",
  },
  {
    question: "En cuánto tiempo se puede implementar?",
    answer:
      "Normalmente el setup inicial puede estar listo en pocos días, según el volumen de canales, agenda y configuración comercial.",
  },
  {
    question: "Sirve para clínicas pequeñas?",
    answer:
      "Sí. El sistema está pensado tanto para clínicas independientes como para grupos con varias sedes.",
  },
  {
    question: "Puede responder fuera de horario?",
    answer:
      "Sí, opera 24/7 para no perder oportunidades cuando recepción no está disponible.",
  },
  {
    question: "Cómo se mide el retorno?",
    answer:
      "Con métricas de leads recuperados, citas agendadas, ventas adicionales y ROI en periodos de 3, 6 y 12 meses.",
  },
] as const

const SEO_CLUSTER_ITEMS = [
  {
    href: "/solucion",
    title: "Qué hace Clinvetia",
    description: "Entiende la propuesta completa del software veterinario con IA.",
  },
  {
    href: "/como-funciona",
    title: "Cómo funciona el sistema",
    description: "Ve el flujo operativo desde la primera consulta hasta la cita confirmada.",
  },
  {
    href: "/escenarios",
    title: "Casos de uso",
    description: "Explora ejemplos reales de atención y automatización en clínicas veterinarias.",
  },
  {
    href: "/contacto",
    title: "Hablar con el equipo",
    description: "Si ya has resuelto tus dudas, pide una demo adaptada a tu clínica.",
  },
] as const

export default function FaqsPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: appUrl },
      { "@type": "ListItem", position: 2, name: "Preguntas frecuentes", item: `${appUrl}/faqs` },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="text-center">
          <Badge variant="secondary">FAQ</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Preguntas frecuentes sobre Clinvetia</h1>
          <p className="mt-4 text-muted-foreground">
            Respuestas rápidas sobre implementación, operación y resultados.
          </p>
        </div>

        <GlassCard className="mx-auto w-full max-w-[50rem] p-1.5 sm:max-w-2xl lg:max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((item, idx) => (
              <AccordionItem key={item.question} value={`faq-${idx}`} last={idx === FAQS.length - 1}>
                <AccordionTrigger className="px-3 text-base font-medium sm:px-4">{item.question}</AccordionTrigger>
                <AccordionContent className="px-3 text-sm sm:px-4 md:text-base">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </GlassCard>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/demo">Reservar demo</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/contacto">Hablar con el equipo</Link>
          </Button>
        </div>

        <SeoLinkCluster
          title="Sigue explorando páginas relacionadas"
          description="Si vienes desde una búsqueda informacional, estos enlaces te llevan a las páginas comerciales e informativas que completan el recorrido."
          items={SEO_CLUSTER_ITEMS}
        />
      </div>
    </div>
  )
}
