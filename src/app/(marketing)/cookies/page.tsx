import { LegalLayout } from "@/components/layout/legal-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Información sobre cómo utilizamos las cookies para mejorar tu experiencia.",
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    title: "Política de cookies",
    description: "Información sobre cómo utilizamos las cookies para mejorar tu experiencia.",
    url: "/cookies",
  },
  twitter: {
    card: "summary_large_image",
    title: "Política de cookies",
    description: "Información sobre cómo utilizamos las cookies para mejorar tu experiencia.",
  },
}

const sections = [
  {
    title: "¿Qué son las Cookies?",
    content: "Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo para recordar tus preferencias y ofrecerte una navegación más fluida."
  },
  {
    title: "Cookies Necesarias",
    content: "Estas son esenciales para que la web funcione. Incluyen la autenticación de sesión, tus preferencias de tema (Light/Dark) y el idioma seleccionado."
  },
  {
    title: "Cookies de Rendimiento",
    content: "Utilizamos cookies analíticas anónimas para entender cómo los usuarios interactúan con nuestra plataforma, lo que nos permite optimizar la velocidad y el diseño."
  },
  {
    title: "Control de Cookies",
    content: "Puedes configurar tu navegador para bloquear o alertarte sobre estas cookies, pero algunas partes de la web podrían no funcionar correctamente."
  }
]

export default function CookiesPage() {
  return (
    <LegalLayout
      badge="Cookies"
      title="Política de Cookies"
      description="Transparencia total sobre la tecnología que utilizamos para que nuestra web funcione."
      sections={sections}
      lastUpdated="24 de febrero de 2026"
    />
  )
}
