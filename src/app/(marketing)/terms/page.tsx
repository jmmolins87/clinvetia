import { LegalLayout } from "@/components/layout/legal-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Términos y condiciones legales para el uso de la plataforma Clinvetia.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Términos de uso",
    description: "Términos y condiciones legales para el uso de la plataforma Clinvetia.",
    url: "/terms",
  },
  twitter: {
    card: "summary_large_image",
    title: "Términos de uso",
    description: "Términos y condiciones legales para el uso de la plataforma Clinvetia.",
  },
}

const sections = [
  {
    title: "Aceptación de los Términos",
    content: "Al acceder y utilizar Clinvetia, aceptas cumplir con estos términos de servicio. Si no estás de acuerdo con alguna parte, no debes utilizar la plataforma."
  },
  {
    title: "Uso del Servicio",
    content: "Clinvetia proporciona herramientas de IA para la gestión veterinaria. Te comprometes a usar el servicio de manera responsable y profesional, respetando siempre el criterio médico veterinario."
  },
  {
    title: "Responsabilidad",
    content: "El sistema de IA es una herramienta de apoyo. La responsabilidad final sobre diagnósticos, tratamientos y atención médica recae siempre en el profesional veterinario colegiado."
  },
  {
    title: "Propiedad Intelectual",
    content: "Todo el software, algoritmos y diseños de Clinvetia son propiedad exclusiva de la empresa. Se concede una licencia de uso limitada y no transferible por la duración del contrato."
  },
  {
    title: "Cancelación",
    content: "Puedes cancelar tu suscripción en cualquier momento. El acceso al servicio se mantendrá activo hasta el final del periodo de facturación actual."
  }
]

export default function TermsPage() {
  return (
    <LegalLayout
      badge="Legal"
      title="Términos de Uso"
      description="Regulamos la relación entre Clinvetia y tu centro veterinario para garantizar el mejor servicio."
      sections={sections}
      lastUpdated="24 de febrero de 2026"
    />
  )
}
