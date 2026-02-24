import { LegalLayout } from "@/components/layout/legal-layout"

export const metadata = {
  title: "Política de Privacidad · Clinvetia",
  description: "Información detallada sobre cómo protegemos y gestionamos tus datos personales.",
}

const sections = [
  {
    title: "Recopilación de Datos",
    content: "Recopilamos información necesaria para la prestación de nuestros servicios de IA veterinaria, incluyendo datos de contacto de la clínica, información de agenda y detalles básicos de pacientes proporcionados por los dueños."
  },
  {
    title: "Uso de la Información",
    content: "Los datos se utilizan exclusivamente para entrenar y mejorar la precisión de nuestros agentes de IA en tu clínica, gestionar citas y enviar recordatorios automáticos autorizados."
  },
  {
    title: "Protección de Datos",
    content: "Implementamos medidas de seguridad de nivel empresarial, incluyendo cifrado de extremo a extremo y auditorías periódicas, para garantizar que la información de tus pacientes esté siempre a salvo."
  },
  {
    title: "Tus Derechos",
    content: "Como usuario, tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento, conforme al RGPD y la normativa vigente."
  },
  {
    title: "Compartición con Terceros",
    content: "Clinvetia nunca vende tus datos a terceros. Solo compartimos información con proveedores de servicios esenciales (como servicios de mensajería) bajo estrictos contratos de confidencialidad."
  }
]

export default function PrivacyPage() {
  return (
    <LegalLayout
      badge="Privacidad"
      title="Tu privacidad es nuestra prioridad"
      description="En Clinvetia nos tomamos muy en serio la seguridad de los datos de tu clínica y tus pacientes."
      sections={sections}
      lastUpdated="24 de febrero de 2026"
    />
  )
}
