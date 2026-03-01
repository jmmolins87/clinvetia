import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Solución",
  description: "Conoce la solución de IA veterinaria de Clinvetia para atención, triaje, agenda y seguimiento automatizado.",
  alternates: {
    canonical: "/solucion",
  },
  openGraph: {
    title: "Solución",
    description: "Conoce la solución de IA veterinaria de Clinvetia para atención, triaje, agenda y seguimiento automatizado.",
    url: "/solucion",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solución",
    description: "Conoce la solución de IA veterinaria de Clinvetia para atención, triaje, agenda y seguimiento automatizado.",
  },
}

export default function SolucionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
