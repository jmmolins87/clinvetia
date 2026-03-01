import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Escenarios",
  description: "Explora casos reales de uso de Clinvetia en clínicas veterinarias: urgencias, seguimiento y fidelización.",
  alternates: {
    canonical: "/escenarios",
  },
  openGraph: {
    title: "Escenarios",
    description: "Explora casos reales de uso de Clinvetia en clínicas veterinarias: urgencias, seguimiento y fidelización.",
    url: "/escenarios",
  },
  twitter: {
    card: "summary_large_image",
    title: "Escenarios",
    description: "Explora casos reales de uso de Clinvetia en clínicas veterinarias: urgencias, seguimiento y fidelización.",
  },
}

export default function EscenariosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
