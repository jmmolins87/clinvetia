import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Resuelve tus dudas sobre Clinvetia: precios, implementación, tiempos, integraciones y resultados para clínicas veterinarias.",
  alternates: {
    canonical: "/faqs",
  },
  openGraph: {
    title: "Preguntas frecuentes",
    description: "Resuelve tus dudas sobre Clinvetia: precios, implementación, tiempos, integraciones y resultados para clínicas veterinarias.",
    url: "/faqs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Preguntas frecuentes",
    description: "Resuelve tus dudas sobre Clinvetia: precios, implementación, tiempos, integraciones y resultados para clínicas veterinarias.",
  },
}

export default function FaqsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
