import Link from "next/link"

import { SeoLinkCluster } from "@/components/marketing/seo-link-cluster"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CtaSection } from "@/components/marketing/cta-section"
import { GlassCard } from "@/components/ui/GlassCard"
import type { SeoLandingConfig } from "@/lib/seo-landings"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clinvetia.com"

export function SeoLandingPage({ config }: { config: SeoLandingConfig }) {
  const pageUrl = `${appUrl}/${config.slug}`
  const isMarketingPage = config.category === "marketing"

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: config.metaTitle,
    serviceType: config.metaTitle,
    provider: {
      "@type": "Organization",
      name: "Clinvetia",
      url: appUrl,
    },
    areaServed: "ES",
    audience: {
      "@type": "Audience",
      audienceType: "Clínicas veterinarias",
    },
    offers: {
      "@type": "Offer",
      url: `${appUrl}/demo`,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
    url: pageUrl,
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((item) => ({
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
      { "@type": "ListItem", position: 2, name: config.metaTitle, item: pageUrl },
    ],
  }

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary">{config.heroBadge}</Badge>
            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">{config.heroTitle}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {config.heroDescription}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/demo">Reservar demo</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/calculadora">Calcular ROI</Link>
              </Button>
            </div>
            {isMarketingPage ? (
              <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
                <GlassCard className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Respuesta</p>
                  <p className="mt-2 text-sm text-muted-foreground">Reduce el tiempo entre lead y primera respuesta útil.</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Seguimiento</p>
                  <p className="mt-2 text-sm text-muted-foreground">Evita que la oportunidad se enfríe tras el primer contacto.</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Conversión</p>
                  <p className="mt-2 text-sm text-muted-foreground">Conecta marketing, recepción y agenda para cerrar más citas.</p>
                </GlassCard>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <GlassCard className="p-8 md:p-10">
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{config.intro}</p>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-2">
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight">{config.problemTitle}</h2>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground md:text-base">
              {config.problemPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight">{config.solutionTitle}</h2>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground md:text-base">
              {config.solutionPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">{config.useCasesTitle}</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {config.useCases.map((item) => (
                <GlassCard key={item.title} className="h-full p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <GlassCard className="p-6 md:p-8">
              <h2 className="text-2xl font-bold tracking-tight">{config.benefitsTitle}</h2>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {config.benefits.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground md:text-base">
                    {item}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <Badge variant="secondary">FAQ</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{config.faqTitle}</h2>
            </div>
            <GlassCard className="p-2">
              <Accordion type="single" collapsible className="w-full">
                {config.faqs.map((item, idx) => (
                  <AccordionItem key={item.question} value={`faq-${idx}`} last={idx === config.faqs.length - 1}>
                    <AccordionTrigger className="px-4 text-base font-medium">{item.question}</AccordionTrigger>
                    <AccordionContent className="px-4 text-sm md:text-base">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </GlassCard>
          </div>
        </div>
      </section>

      <SeoLinkCluster
        badge="Páginas relacionadas"
        title={isMarketingPage ? "Continúa explorando captación y conversión veterinaria" : "Continúa explorando la solución"}
        description={
          isMarketingPage
            ? "Estos enlaces conectan esta búsqueda con las páginas de Clinvetia más orientadas a leads, seguimiento comercial y citas."
            : "Estos enlaces conectan esta búsqueda con las páginas de mayor intención comercial e informacional de Clinvetia."
        }
        items={config.clusterLinks}
      />

      <CtaSection
        title={
          isMarketingPage
            ? "¿Quieres revisar cómo convertir más leads en citas?"
            : "¿Quieres ver cómo encaja esto en tu clínica?"
        }
        description={
          isMarketingPage
            ? "Reserva una demo y revisa con el equipo de Clinvetia qué cambios en respuesta, seguimiento y automatización tendrían más impacto comercial en tu clínica."
            : "Reserva una demo y revisa con el equipo de Clinvetia qué flujo, automatizaciones y resultados tendría sentido para tu operativa."
        }
        actions={[
          { label: "Reservar demo", href: "/demo", icon: "calendar" },
          { label: "Calcular ROI", href: "/calculadora", variant: "secondary", icon: "calculator" },
        ]}
      />
    </div>
  )
}
