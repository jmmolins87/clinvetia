import { LegalLayout } from "@/components/layout/legal-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Seguridad",
  description: "Detalles sobre nuestras medidas de seguridad y protección de la infraestructura.",
  alternates: {
    canonical: "/security",
  },
  openGraph: {
    title: "Seguridad",
    description: "Detalles sobre nuestras medidas de seguridad y protección de la infraestructura.",
    url: "/security",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seguridad",
    description: "Detalles sobre nuestras medidas de seguridad y protección de la infraestructura.",
  },
}

const sections = [
  {
    title: "Cifrado de Datos",
    content: "Toda la comunicación entre tu clínica y nuestros servidores se realiza a través de protocolos TLS 1.3 con cifrado de nivel bancario AES-256."
  },
  {
    title: "Infraestructura Segura",
    content: "Nuestros servidores están alojados en centros de datos con certificación ISO 27001 y vigilancia física 24/7, garantizando una disponibilidad del 99.9%."
  },
  {
    title: "Copias de Seguridad",
    content: "Realizamos backups automáticos cada hora. Tus datos están replicados en múltiples ubicaciones geográficas para garantizar la recuperación ante cualquier desastre."
  },
  {
    title: "Protección de IA",
    content: "Nuestros modelos de IA están aislados por cliente. Los datos de una clínica nunca se utilizan para responder consultas de otra."
  },
  {
    title: "Reporte de Vulnerabilidades",
    content: "Si detectas cualquier fallo de seguridad, por favor infórmanos de inmediato a security@clinvetia.com. Recompensamos los reportes responsables."
  }
]

export default function SecurityPage() {
  return (
    <LegalLayout
      badge="Seguridad"
      title="Seguridad de nivel empresarial"
      description="Protegemos el corazón de tu clínica con la tecnología de defensa más avanzada."
      sections={sections}
      lastUpdated="24 de febrero de 2026"
    />
  )
}
