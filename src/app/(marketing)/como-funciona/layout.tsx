import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Cómo funciona",
  description: "Descubre el flujo completo de Clinvetia: recepción de consultas, triaje inteligente y agendado automático.",
  alternates: {
    canonical: "/como-funciona",
  },
  openGraph: {
    title: "Cómo funciona",
    description: "Descubre el flujo completo de Clinvetia: recepción de consultas, triaje inteligente y agendado automático.",
    url: "/como-funciona",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo funciona",
    description: "Descubre el flujo completo de Clinvetia: recepción de consultas, triaje inteligente y agendado automático.",
  },
}

export default function ComoFuncionaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
