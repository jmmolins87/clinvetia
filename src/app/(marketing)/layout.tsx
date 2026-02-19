import type { Metadata } from "next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SmoothScroll } from "@/components/providers/smooth-scroll"

export const metadata: Metadata = {
  title: {
    template: "%s · Clinvetia",
    default: "Clinvetia — Software veterinario con IA",
  },
  description:
    "Clinvetia automatiza la gestión de tu clínica veterinaria con agentes de inteligencia artificial. Comprende consultas, clasifica urgencias y agenda citas automáticamente.",
  openGraph: {
    siteName: "Clinvetia",
    locale: "es_ES",
    type: "website",
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
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}
