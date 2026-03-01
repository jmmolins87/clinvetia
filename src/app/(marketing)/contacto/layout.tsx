import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta con Clinvetia para resolver dudas y recibir una propuesta adaptada a tu clínica veterinaria.",
  alternates: {
    canonical: "/contacto",
  },
  openGraph: {
    title: "Contacto",
    description: "Contacta con Clinvetia para resolver dudas y recibir una propuesta adaptada a tu clínica veterinaria.",
    url: "/contacto",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto",
    description: "Contacta con Clinvetia para resolver dudas y recibir una propuesta adaptada a tu clínica veterinaria.",
  },
}

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
