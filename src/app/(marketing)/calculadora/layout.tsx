import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Calculadora ROI",
  description: "Calcula en minutos el impacto económico de automatizar la atención y agenda de tu clínica veterinaria.",
  alternates: {
    canonical: "/calculadora",
  },
  openGraph: {
    title: "Calculadora ROI",
    description: "Calcula en minutos el impacto económico de automatizar la atención y agenda de tu clínica veterinaria.",
    url: "/calculadora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora ROI",
    description: "Calcula en minutos el impacto económico de automatizar la atención y agenda de tu clínica veterinaria.",
  },
}

export default function CalculadoraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
