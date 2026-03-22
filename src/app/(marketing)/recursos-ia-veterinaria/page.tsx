import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CtaSection } from "@/components/marketing/cta-section"
import { GlassCard } from "@/components/ui/GlassCard"
import { getSeoLandingConfigs } from "@/lib/seo-landings"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clinvetia.com"
const landingConfigs = getSeoLandingConfigs()
const operationLandings = landingConfigs.filter((item) => item.category === "operaciones")
const marketingLandings = landingConfigs.filter((item) => item.category === "marketing")
const featuredMarketingLandings = marketingLandings.slice(0, 3)

export const metadata: Metadata = {
  title: "Recursos de IA veterinaria",
  description:
    "Explora recursos y páginas de Clinvetia sobre software veterinario con IA, automatización, citas, triaje, recepción y captación para clínicas veterinarias.",
  alternates: {
    canonical: "/recursos-ia-veterinaria",
  },
  openGraph: {
    title: "Recursos de IA veterinaria",
    description:
      "Hub SEO de Clinvetia con páginas sobre automatización, citas, triaje, recepción, chatbot y captación para clínicas veterinarias.",
    url: "/recursos-ia-veterinaria",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recursos de IA veterinaria",
    description:
      "Hub SEO de Clinvetia con páginas sobre automatización, citas, triaje, recepción, chatbot y captación para clínicas veterinarias.",
  },
}

export default function RecursosIaVeterinariaPage() {
  const itemListElement = landingConfigs.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "WebPage",
      name: item.metaTitle,
      url: `${appUrl}/${item.slug}`,
      description: item.metaDescription,
    },
  }))

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Recursos de IA veterinaria",
    url: `${appUrl}/recursos-ia-veterinaria`,
    description:
      "Hub SEO de Clinvetia con páginas sobre automatización, citas, triaje, recepción, chatbot y captación para clínicas veterinarias.",
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Listado de recursos de IA veterinaria",
    itemListElement,
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: appUrl },
      { "@type": "ListItem", position: 2, name: "Recursos de IA veterinaria", item: `${appUrl}/recursos-ia-veterinaria` },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-6xl space-y-12">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary">Hub SEO</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Recursos de IA veterinaria para clínicas que quieren crecer mejor
          </h1>
          <p className="mt-4 text-muted-foreground">
            Aquí agrupamos las páginas más relevantes de Clinvetia sobre software veterinario con IA, automatización,
            gestión de citas, triaje, recepción, captación y seguimiento.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="p-6 md:p-8">
            <Badge variant="secondary">Ruta recomendada</Badge>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">Empieza por el cuello de botella que hoy más te limita</h2>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Si tu problema está en recepción y agenda, empieza por operaciones. Si el problema está en captar, responder
              o convertir mejor los leads que ya entran, prioriza el bloque de marketing y captación.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/software-veterinario-con-ia">Ver operaciones y atención</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/marketing-digital-para-veterinarios">Ver marketing y captación</Link>
              </Button>
            </div>
          </GlassCard>

          <GlassCard className="p-6 md:p-8">
            <Badge variant="secondary">Prioridades comerciales</Badge>
            <div className="mt-4 space-y-4">
              {featuredMarketingLandings.map((item) => (
                <div key={item.slug} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Link href={`/${item.slug}`} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <h3 className="text-base font-semibold">{item.metaTitle}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.metaDescription}</p>
                  </Link>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-10">
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold tracking-tight">Operaciones y atención</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Páginas enfocadas en recepción, triaje, agenda, chatbot y seguimiento clínico.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {operationLandings.map((item) => (
                <GlassCard key={item.slug} className="h-full p-5 transition-colors hover:border-primary/30">
                  <Link href={`/${item.slug}`} className="block h-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <h3 className="text-lg font-semibold">{item.metaTitle}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.metaDescription}</p>
                  </Link>
                </GlassCard>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold tracking-tight">Marketing y captación</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Páginas orientadas a leads, conversión y crecimiento comercial para clínicas veterinarias.
              </p>
            </div>
            <GlassCard className="mb-5 p-5">
              <p className="text-sm text-muted-foreground md:text-base">
                Este bloque está pensado para clínicas que ya generan demanda, pero todavía pierden oportunidades por
                tardar en responder, no hacer seguimiento o dejar desconectados marketing, mensajería y agenda.
              </p>
            </GlassCard>
            <div
              className={
                marketingLandings.length === 1
                  ? "grid gap-4 md:max-w-2xl"
                  : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              }
            >
              {marketingLandings.map((item) => (
                <GlassCard key={item.slug} className="h-full p-5 transition-colors hover:border-primary/30">
                  <Link href={`/${item.slug}`} className="block h-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <h3 className="text-lg font-semibold">{item.metaTitle}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.metaDescription}</p>
                  </Link>
                </GlassCard>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/demo">Reservar demo</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/calculadora">Calcular ROI</Link>
          </Button>
        </div>
      </div>

      <CtaSection
        title="¿Quieres aplicar esto a la operativa real de tu clínica?"
        description="Reserva una demo para revisar qué automatizaciones, flujos y métricas tendría sentido priorizar en tu caso."
        actions={[
          { label: "Reservar demo", href: "/demo" },
          { label: "Hablar con el equipo", href: "/contacto", variant: "secondary" },
        ]}
      />
    </div>
  )
}
