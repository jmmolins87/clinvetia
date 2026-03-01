import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Reservar demo",
  description: "Reserva una demo de Clinvetia y descubre cómo automatizar consultas, triaje y citas en tu clínica veterinaria.",
  alternates: {
    canonical: "/demo",
  },
  openGraph: {
    title: "Reservar demo",
    description: "Reserva una demo de Clinvetia y descubre cómo automatizar consultas, triaje y citas en tu clínica veterinaria.",
    url: "/demo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reservar demo",
    description: "Reserva una demo de Clinvetia y descubre cómo automatizar consultas, triaje y citas en tu clínica veterinaria.",
  },
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
