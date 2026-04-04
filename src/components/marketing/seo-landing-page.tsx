"use client"

import Link from "next/link"

import { SeoCard } from "@/components/marketing/seo-card"
import { SeoLinkCluster } from "@/components/marketing/seo-link-cluster"
import { useTranslationSkeleton } from "@/components/providers/translation-skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CtaSection } from "@/components/marketing/cta-section"
import { GlassCard } from "@/components/ui/GlassCard"
import { getSeoLandingConfig, type SeoLandingConfig } from "@/lib/seo-landings"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clinvetia.com"

export function SeoLandingPage({ config }: { config: SeoLandingConfig }) {
  const { locale } = useTranslationSkeleton()
  const localizedConfig = getSeoLandingConfig(config.slug, locale)
  const pageUrl = `${appUrl}/${localizedConfig.slug}`
  const isMarketingPage = localizedConfig.category === "marketing"
  const labels =
    locale === "en"
      ? {
          bookDemo: "Book demo",
          calculateRoi: "Calculate ROI",
          response: "Response",
          responseDesc: "Reduce the time between a new lead and the first useful reply.",
          followUp: "Follow-up",
          followUpDesc: "Prevent opportunities from going cold after the first contact.",
          conversion: "Conversion",
          conversionDesc: "Connect marketing, reception, and scheduling to close more appointments.",
          faq: "FAQ",
          relatedPages: "Related pages",
          exploreMarketing: "Keep exploring veterinary acquisition and conversion",
          exploreSolution: "Keep exploring the solution",
          exploreMarketingDesc:
            "These links connect this search with the Clinvetia pages most focused on leads, commercial follow-up, and appointments.",
          exploreSolutionDesc:
            "These links connect this search with Clinvetia pages that combine stronger commercial intent with supporting information.",
          ctaMarketingTitle: "Want to review how to turn more leads into appointments?",
          ctaOpsTitle: "Want to see how this fits your clinic?",
          ctaMarketingDesc:
            "Book a demo and review with the Clinvetia team which reply, follow-up, and automation changes would have the biggest commercial impact on your clinic.",
          ctaOpsDesc:
            "Book a demo and review with the Clinvetia team which workflows, automations, and results make sense for your operation.",
        }
      : {
          bookDemo: "Reservar demo",
          calculateRoi: "Calcular ROI",
          response: "Respuesta",
          responseDesc: "Reduce el tiempo entre lead y primera respuesta útil.",
          followUp: "Seguimiento",
          followUpDesc: "Evita que la oportunidad se enfríe tras el primer contacto.",
          conversion: "Conversión",
          conversionDesc: "Conecta marketing, recepción y agenda para cerrar más citas.",
          faq: "FAQ",
          relatedPages: "Páginas relacionadas",
          exploreMarketing: "Continúa explorando captación y conversión veterinaria",
          exploreSolution: "Continúa explorando la solución",
          exploreMarketingDesc:
            "Estos enlaces conectan esta búsqueda con las páginas de Clinvetia más orientadas a leads, seguimiento comercial y citas.",
          exploreSolutionDesc:
            "Estos enlaces conectan esta búsqueda con las páginas de mayor intención comercial e informacional de Clinvetia.",
          ctaMarketingTitle: "¿Quieres revisar cómo convertir más leads en citas?",
          ctaOpsTitle: "¿Quieres ver cómo encaja esto en tu clínica?",
          ctaMarketingDesc:
            "Reserva una demo y revisa con el equipo de Clinvetia qué cambios en respuesta, seguimiento y automatización tendrían más impacto comercial en tu clínica.",
          ctaOpsDesc:
            "Reserva una demo y revisa con el equipo de Clinvetia qué flujo, automatizaciones y resultados tendría sentido para tu operativa.",
        }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: localizedConfig.metaTitle,
    serviceType: localizedConfig.metaTitle,
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
    mainEntity: localizedConfig.faqs.map((item) => ({
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
      { "@type": "ListItem", position: 1, name: locale === "en" ? "Home" : "Inicio", item: appUrl },
      { "@type": "ListItem", position: 2, name: localizedConfig.metaTitle, item: pageUrl },
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
          <div className="mx-auto max-w-6xl text-center">
            <Badge variant="secondary">{localizedConfig.heroBadge}</Badge>
            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">{localizedConfig.heroTitle}</h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              {localizedConfig.heroDescription}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/demo">{labels.bookDemo}</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/calculadora">{labels.calculateRoi}</Link>
              </Button>
            </div>
            {isMarketingPage ? (
              <div className="mt-8 grid items-stretch gap-3 text-left sm:grid-cols-3">
                <GlassCard className="h-full p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">{labels.response}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{labels.responseDesc}</p>
                </GlassCard>
                <GlassCard className="h-full p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">{labels.followUp}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{labels.followUpDesc}</p>
                </GlassCard>
                <GlassCard className="h-full p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">{labels.conversion}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{labels.conversionDesc}</p>
                </GlassCard>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <GlassCard className="w-full p-8 md:p-10">
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{localizedConfig.intro}</p>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto grid max-w-6xl items-stretch gap-6 px-4 lg:grid-cols-2">
          <GlassCard className="h-full p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight">{localizedConfig.problemTitle}</h2>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground md:text-base">
              {localizedConfig.problemPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="h-full p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight">{localizedConfig.solutionTitle}</h2>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground md:text-base">
              {localizedConfig.solutionPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">{localizedConfig.useCasesTitle}</h2>
            <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
              {localizedConfig.useCases.map((item) => (
                <SeoCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <GlassCard className="w-full p-6 md:p-8">
              <h2 className="text-2xl font-bold tracking-tight">{localizedConfig.benefitsTitle}</h2>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {localizedConfig.benefits.map((item) => (
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
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <Badge variant="secondary">{labels.faq}</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{localizedConfig.faqTitle}</h2>
            </div>
            <GlassCard className="mx-auto w-full max-w-[20rem] p-1.5 sm:max-w-2xl lg:max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {localizedConfig.faqs.map((item, idx) => (
                  <AccordionItem key={item.question} value={`faq-${idx}`} last={idx === localizedConfig.faqs.length - 1}>
                    <AccordionTrigger className="px-3 text-base font-medium sm:px-4">{item.question}</AccordionTrigger>
                    <AccordionContent className="px-3 text-sm sm:px-4 md:text-base">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </GlassCard>
          </div>
        </div>
      </section>

      <SeoLinkCluster
        badge={labels.relatedPages}
        title={isMarketingPage ? labels.exploreMarketing : labels.exploreSolution}
        description={
          isMarketingPage
            ? labels.exploreMarketingDesc
            : labels.exploreSolutionDesc
        }
        items={localizedConfig.clusterLinks}
      />

      <CtaSection
        title={
          isMarketingPage
            ? labels.ctaMarketingTitle
            : labels.ctaOpsTitle
        }
        description={
          isMarketingPage
            ? labels.ctaMarketingDesc
            : labels.ctaOpsDesc
        }
        actions={[
          { label: "Reservar demo", href: "/demo", icon: "calendar" },
          { label: "Calcular ROI", href: "/calculadora", variant: "secondary", icon: "calculator" },
        ]}
      />
    </div>
  )
}
