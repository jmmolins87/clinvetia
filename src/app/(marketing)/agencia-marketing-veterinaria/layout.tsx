import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Agencia marketing veterinaria",
  description:
    "Clinvetia es una agencia de marketing veterinario especializada en captación, automatización IA y seguimiento comercial para clínicas veterinarias.",
  alternates: {
    canonical: "/agencia-marketing-veterinaria",
  },
  openGraph: {
    title: "Agencia marketing veterinaria",
    description:
      "Captación de leads, automatización con IA y seguimiento comercial para clínicas veterinarias.",
    url: "/agencia-marketing-veterinaria",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agencia marketing veterinaria",
    description:
      "Captación de leads, automatización con IA y seguimiento comercial para clínicas veterinarias.",
  },
}

export default function AgenciaMarketingVeterinariaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
