import type { Metadata } from "next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SmoothScroll } from "@/components/providers/smooth-scroll"
import { MarketingOverlays } from "@/components/marketing/marketing-overlays"

export const metadata: Metadata = {
  title: {
    template: "%s · Clinvetia",
    default: "Clinvetia — Software veterinario con IA",
  },
  description:
    "Clinvetia automatiza la gestión de tu clínica veterinaria con agentes de inteligencia artificial. Comprende consultas, clasifica urgencias y agenda citas automáticamente.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Clinvetia — Software veterinario con IA",
    description:
      "Clinvetia automatiza la gestión de tu clínica veterinaria con agentes de inteligencia artificial. Comprende consultas, clasifica urgencias y agenda citas automáticamente.",
    url: "/",
    siteName: "Clinvetia",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinvetia — Software veterinario con IA",
    description:
      "Clinvetia automatiza la gestión de tu clínica veterinaria con agentes de inteligencia artificial. Comprende consultas, clasifica urgencias y agenda citas automáticamente.",
  },
}

// ── Marketing Layout ──────────────────────────────────────────────────────────
// Estructura: SmoothScroll → Navbar sticky → <main flex-1> → Footer.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SmoothScroll />
      <div className="flex min-h-screen flex-col overflow-x-hidden max-w-full">
        <Navbar />
        <main className="flex-1 pt-16 max-w-full">
          {children}
        </main>
        <Footer />
        <MarketingOverlays />
      </div>
    </>
  )
}
